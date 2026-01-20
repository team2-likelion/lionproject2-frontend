import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as mentorApi from '@/api/mentor';
import * as lessonApi from '@/api/lesson';
import type { MentorAvailabilityItem } from '@/api/mentor';

// 요일 매핑: 백엔드 dayOfWeek → JavaScript Date.getDay()
const DAY_OF_WEEK_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

interface AvailabilityCalendarProps {
  tutorialId: number;
  mentorId: number;
  onDateSelect: (date: Date) => void;
}

export function AvailabilityCalendar({
  tutorialId,
  mentorId,
  onDateSelect,
}: AvailabilityCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());
  const [availability, setAvailability] = useState<MentorAvailabilityItem[]>([]);
  const [dateStatuses, setDateStatuses] = useState<Map<string, { available: number; total: number }>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // 1. 멘토 가용 시간 조회 (초기 1회)
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await mentorApi.getMentorAvailability(mentorId);
        if (res.success && res.data) {
          setAvailability(res.data.availability.filter(a => a.active));
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      }
    };
    fetchAvailability();
  }, [mentorId]);

  // 가용 요일 Set 생성
  const availableDays = useMemo(() => {
    return new Set(availability.map(a => DAY_OF_WEEK_MAP[a.dayOfWeek]));
  }, [availability]);

  // 2. 현재 월의 가용 날짜들에 대해 슬롯 상태 조회
  useEffect(() => {
    if (availability.length === 0) return;

    const fetchMonthSlots = async () => {
      setIsLoading(true);
      const today = startOfDay(new Date());
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const days = eachDayOfInterval({ start, end });

      // 가용 요일에 해당하고 오늘 이후인 날짜만 필터링
      const targetDays = days.filter(day =>
        availableDays.has(day.getDay()) && !isBefore(day, today)
      );

      // 배치 조회 (동시에 최대 5개씩)
      const results = new Map<string, { available: number; total: number }>();

      const batchSize = 5;
      for (let i = 0; i < targetDays.length; i += batchSize) {
        const batch = targetDays.slice(i, i + batchSize);
        const promises = batch.map(async (day) => {
          try {
            const dateStr = format(day, 'yyyy-MM-dd');
            const res = await lessonApi.getAvailableSlots(tutorialId, dateStr);
            if (res.success && res.data) {
              const slots = res.data.slots;
              const available = slots.filter(s => s.available).length;
              const total = slots.length;
              return { dateStr, available, total };
            }
          } catch {
            return null;
          }
          return null;
        });

        const batchResults = await Promise.all(promises);
        batchResults.forEach(result => {
          if (result) {
            results.set(result.dateStr, { available: result.available, total: result.total });
          }
        });
      }

      setDateStatuses(results);
      setIsLoading(false);
    };

    fetchMonthSlots();
  }, [month, availability, availableDays, tutorialId]);

  // 3. modifiers 생성
  const modifiers = useMemo(() => {
    const today = startOfDay(new Date());
    const smoothDays: Date[] = [];
    const slightDays: Date[] = [];
    const busyDays: Date[] = [];
    const fullDays: Date[] = [];

    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    days.forEach(day => {
      // 과거 날짜 또는 멘토 비가용일은 스킵
      if (isBefore(day, today) || !availableDays.has(day.getDay())) {
        return;
      }

      // 슬롯 상태 확인
      const dateStr = format(day, 'yyyy-MM-dd');
      const status = dateStatuses.get(dateStr);

      if (!status || status.total === 0) {
        return;
      }

      const ratio = status.available / status.total;

      if (status.available === 0) {
        fullDays.push(day);
      } else if (ratio >= 0.5) {
        smoothDays.push(day);
      } else if (ratio >= 0.3) {
        slightDays.push(day);
      } else {
        busyDays.push(day);
      }
    });

    return {
      smooth: smoothDays,
      slight: slightDays,
      busy: busyDays,
      full: fullDays,
    };
  }, [month, availableDays, dateStatuses]);

  // 4. 날짜 클릭 핸들러
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    const today = startOfDay(new Date());

    // 과거 날짜 또는 비가용일 클릭 불가
    if (isBefore(date, today) || !availableDays.has(date.getDay())) {
      return;
    }

    // 마감된 날짜 클릭 불가
    const dateStr = format(date, 'yyyy-MM-dd');
    const status = dateStatuses.get(dateStr);
    if (status && status.available === 0) {
      return;
    }

    onDateSelect(date);
  };

  // 비활성화할 날짜 계산
  const disabledDays = useMemo(() => {
    const today = startOfDay(new Date());
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    // 과거 날짜, 멘토 비가용일, 마감된 날짜
    return days.filter(day => {
      if (isBefore(day, today)) return true;
      if (!availableDays.has(day.getDay())) return true;

      const dateStr = format(day, 'yyyy-MM-dd');
      const status = dateStatuses.get(dateStr);
      if (status && status.available === 0) return true;

      return false;
    });
  }, [month, availableDays, dateStatuses]);

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          현재 예약 현황
          {isLoading && (
            <span className="material-symbols-outlined animate-spin text-sm text-muted-foreground">
              progress_activity
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          onSelect={handleSelect}
          locale={ko}
          modifiers={modifiers}
          modifiersClassNames={{
            smooth: 'bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/50 hover:scale-105 hover:shadow-sm font-semibold cursor-pointer transition-all duration-200',
            slight: 'bg-yellow-500/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/50 hover:scale-105 hover:shadow-sm font-semibold cursor-pointer transition-all duration-200',
            busy: 'bg-orange-500/30 text-orange-700 dark:text-orange-300 hover:bg-orange-500/50 hover:scale-105 hover:shadow-sm font-semibold cursor-pointer transition-all duration-200',
            full: 'bg-red-500/20 text-red-500 dark:text-red-400 cursor-not-allowed opacity-50',
          }}
          disabled={disabledDays}
          className="rounded-md [--cell-size:2.25rem]"
          classNames={{
            caption_label: "text-sm font-semibold",
            nav: "absolute inset-x-0 top-0",
            button_previous: "h-7 w-7",
            button_next: "h-7 w-7",
            weekday: "text-xs font-medium text-muted-foreground",
            day: "h-9 w-9 text-sm p-0 rounded-lg",
          }}
        />

        {/* 범례 */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" /> 원활
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-500" /> 조금
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500" /> 혼잡
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-muted-foreground/50" /> 불가
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
