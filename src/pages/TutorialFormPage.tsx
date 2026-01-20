import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as tutorialApi from '@/api/tutorial';

export default function TutorialFormPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [durationUnit, setDurationUnit] = useState('min');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e) {
      // 한글 IME 조합 중이면 무시
      if (e.nativeEvent.isComposing) return;
      if (e.key !== 'Enter') return;
      e.preventDefault();
    }

    if (skillInput.trim() && skills.length < 5) {
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!title.trim()) {
      alert('수업 제목을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      alert('수업 설명을 입력해주세요.');
      return;
    }
    if (!price || parseInt(price) <= 0) {
      alert('수강료를 입력해주세요.');
      return;
    }
    if (skills.length === 0) {
      alert('최소 1개 이상의 기술 태그를 추가해주세요.');
      return;
    }

    // 시간 계산 (분 단위)
    const durationInMinutes = durationUnit === 'hour'
      ? parseInt(duration) * 60
      : parseInt(duration);

    setIsSubmitting(true);
    try {
      const response = await tutorialApi.createTutorial({
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price),
        duration: durationInMinutes,
        skills,
      });

      if (response.success) {
        alert('과외가 성공적으로 등록되었습니다!');
        navigate('/mentor/dashboard');
      } else {
        alert(response.message || '과외 등록에 실패했습니다.');
      }
    } catch (error: unknown) {
      console.error('Tutorial creation error:', error);
      const errorMessage = error instanceof Error ? error.message : '과외 등록 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16">
      <main className="max-w-[800px] mx-auto px-6 py-10">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black leading-tight tracking-tight">과외 정보 등록</h1>
            <p className="text-muted-foreground text-base">
              나만의 전문성을 공유하고 함께 성장할 수강생을 모집하세요.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/mentor/dashboard">대시보드로 돌아가기</Link>
          </Button>
        </div>

        {/* Registration Form */}
        <Card>
          <CardContent className="p-0">
            {/* Section: Basic Info */}
            <div className="p-6 border-b">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">info</span>
                  기본 정보
                </CardTitle>
              </CardHeader>

              <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <Label>수업 제목</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 자바스크립트 기초부터 리액트 실무까지"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    수강생의 이목을 끌 수 있는 명확한 제목을 입력해 주세요.
                  </p>
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <Label>수업 상세 설명</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="커리큘럼, 대상 독자, 수업 방식 등을 자유롭게 기술해 주세요. Markdown 지원"
                    className="min-h-[240px] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section: Skills & Tags */}
            <div className="p-6 border-b">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">label</span>
                  사용 기술 (태그)
                </CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill) => (
                    <Badge key={skill} className="gap-1.5">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-destructive"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="기술 스택 입력 후 Enter (예: Next.js, Docker)"
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-primary/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-muted-foreground hover:text-primary">
                      add
                    </span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  최대 5개까지 등록 가능하며, 등록된 태그는 검색 노출에 사용됩니다.
                </p>
              </div>
            </div>

            {/* Section: Pricing & Schedule */}
            <div className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                  수강료 및 수업 시간
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>회당 수강료</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      ₩
                    </span>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="h-12 pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>1회 수업 시간</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="60"
                      className="h-12 flex-1"
                    />
                    <Select value={durationUnit} onValueChange={setDurationUnit}>
                      <SelectTrigger className="w-24 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="min">분</SelectItem>
                        <SelectItem value="hour">시간</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg flex gap-3">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <div>
                  <p className="text-sm font-bold">DevSolve 안심 결제 시스템</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    등록하신 수강료의 10%가 플랫폼 이용 수수료로 차감되어 정산됩니다.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate('/mentor/dashboard')}>취소</Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-10 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? '저장 중...' : '과외 정보 저장하기'}
          </Button>
        </div>
      </main>
    </div>
  );
}
