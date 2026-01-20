import { useState, useEffect } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { TimeSlotGrid } from './TimeSlotGrid';
import * as lessonApi from '@/api/lesson';
import type { Ticket } from '@/api/payment';
import type { TimeSlot } from '@/types';

interface TutorialInfo {
  id: number;
  title: string;
  duration: number;
}

interface LessonBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorial: TutorialInfo;
  ticket: Ticket;
  onSuccess: () => void;
  initialDate?: Date;  // 초기 선택 날짜 (요일 클릭 시)
}

export function LessonBookingDialog({
  open,
  onOpenChange,
  tutorial,
  ticket,
  onSuccess,
  initialDate,
}: LessonBookingDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [message, setMessage] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 날짜 선택 시 시간 슬롯 조회
  useEffect(() => {
    if (!selectedDate || !tutorial.id) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedTime(null);
      setError(null);

      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const res = await lessonApi.getAvailableSlots(tutorial.id, dateStr);

        if (res.success && res.data) {
          setSlots(res.data.slots);
        } else {
          setSlots([]);
          setError(res.message || '시간 슬롯을 불러오는데 실패했습니다.');
        }
      } catch {
        setSlots([]);
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, tutorial.id]);

  // 다이얼로그 열릴 때 초기 날짜 설정 또는 닫힐 때 상태 초기화
  useEffect(() => {
    if (open) {
      // 초기 날짜가 있으면 설정
      if (initialDate) {
        setSelectedDate(initialDate);
      }
    } else {
      // 닫힐 때 초기화
      setSelectedDate(undefined);
      setSelectedTime(null);
      setSlots([]);
      setMessage('');
      setError(null);
    }
  }, [open, initialDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('날짜와 시간을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await lessonApi.requestLesson(ticket.id, {
        lessonDate: format(selectedDate, 'yyyy-MM-dd'),
        lessonTime: selectedTime,
        requestMessage: message || undefined,
      });

      if (res.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(res.message || '수업 신청에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = startOfDay(new Date());
  const disabledDays = { before: addDays(today, 1) }; // 내일부터 선택 가능

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>수업 예약하기</DialogTitle>
          <DialogDescription>
            원하는 날짜와 시간을 선택하여 수업을 예약하세요.
          </DialogDescription>
        </DialogHeader>

        {/* 티켓 정보 */}
        <Card className="bg-muted/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{tutorial.title}</p>
                <p className="text-sm text-muted-foreground">
                  {tutorial.duration}분 수업
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">남은 수강권</p>
                <p className="font-bold text-primary">
                  {ticket.remainingCount} / {ticket.totalCount}회
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 날짜 & 시간 선택 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 달력 */}
          <div>
            <h4 className="font-medium mb-2 text-sm">날짜 선택</h4>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              locale={ko}
              className="rounded-md border"
            />
          </div>

          {/* 시간 슬롯 */}
          <div>
            <h4 className="font-medium mb-2 text-sm">시간 선택</h4>
            {selectedDate ? (
              <div className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  {format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
                </p>
                <TimeSlotGrid
                  slots={slots}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                  isLoading={isLoadingSlots}
                />
              </div>
            ) : (
              <div className="border rounded-md p-4 h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  먼저 날짜를 선택해주세요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 메시지 입력 */}
        <div>
          <h4 className="font-medium mb-2 text-sm">
            멘토에게 전달할 메시지 (선택)
          </h4>
          <Textarea
            placeholder="배우고 싶은 내용이나 질문을 자유롭게 적어주세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {message.length}/500
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || isSubmitting}
          >
            {isSubmitting ? '신청 중...' : '예약 확정하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
