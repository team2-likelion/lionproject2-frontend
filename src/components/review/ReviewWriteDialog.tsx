import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as reviewApi from '@/api/review';

interface ReviewWriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorialId: number;
  tutorialTitle: string;
  mentorNickname: string;
  onSuccess: () => void;
}

export function ReviewWriteDialog({
  open,
  onOpenChange,
  tutorialId,
  tutorialTitle,
  mentorNickname,
  onSuccess,
}: ReviewWriteDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 500;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('별점을 선택해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('리뷰 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await reviewApi.createReview(tutorialId, {
        rating,
        content: content.trim(),
      });

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setError(response.message || '리뷰 등록에 실패했습니다.');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message || '리뷰 등록 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setContent('');
    setError(null);
    onOpenChange(false);
  };

  const displayRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            수업 리뷰 작성하기
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 강의 정보 카드 */}
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl text-primary">
                smart_display
              </span>
            </div>
            <div>
              <p className="font-semibold text-white">{tutorialTitle}</p>
              <p className="text-sm text-slate-400">{mentorNickname} 멘토</p>
            </div>
          </div>

          {/* 별점 선택 */}
          <div className="text-center">
            <p className="text-slate-300 mb-4">수업 만족도는 어떠셨나요?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  <span
                    className={`material-symbols-outlined ${
                      star <= displayRating ? 'text-amber-400' : 'text-slate-600'
                    }`}
                    style={{ fontVariationSettings: star <= displayRating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              리뷰 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
              placeholder="수업은 어떠셨나요? 다른 멘티들에게 도움이 되는 솔직한 후기를 남겨주세요."
              className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-right text-sm text-slate-500 mt-1">
              {content.length} / {maxLength}자
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-12 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-12 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin mr-2">
                  progress_activity
                </span>
                등록 중...
              </>
            ) : (
              '리뷰 등록하기'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
