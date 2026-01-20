import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/types';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoading?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onSelectTime,
  isLoading = false,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <p className="text-sm">해당 날짜에 예약 가능한 시간이 없습니다.</p>
        <p className="text-xs mt-1">다른 날짜를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-primary"></div>
          <span>선택 가능</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary"></div>
          <span>선택됨</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted"></div>
          <span>예약 불가</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => slot.available && onSelectTime(slot.time)}
            disabled={!slot.available}
            className={cn(
              'py-2 px-3 rounded-md text-sm font-medium transition-colors',
              slot.available
                ? selectedTime === slot.time
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-primary text-primary hover:bg-primary/10'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
            title={slot.reason || undefined}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
