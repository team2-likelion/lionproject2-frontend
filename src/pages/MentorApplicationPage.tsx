import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import * as mentorApi from "@/api/mentor";
import type { MentorAvailabilityItem } from "@/api/mentor";

// 요일 옵션 정의
const DAY_OPTIONS = [
  { value: "MONDAY", label: "매주 월요일" },
  { value: "TUESDAY", label: "매주 화요일" },
  { value: "WEDNESDAY", label: "매주 수요일" },
  { value: "THURSDAY", label: "매주 목요일" },
  { value: "FRIDAY", label: "매주 금요일" },
  { value: "SATURDAY", label: "매주 토요일" },
  { value: "SUNDAY", label: "매주 일요일" },
];

// 시간 옵션 정의 (07:00 ~ 22:00)
const TIME_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 7;
  const value = `${hour.toString().padStart(2, "0")}:00`;
  return { value, label: value };
});

// 요일 한글 변환
const getDayLabel = (dayOfWeek: string): string => {
  const dayMap: Record<string, string> = {
    MONDAY: "매주 월요일",
    TUESDAY: "매주 화요일",
    WEDNESDAY: "매주 수요일",
    THURSDAY: "매주 목요일",
    FRIDAY: "매주 금요일",
    SATURDAY: "매주 토요일",
    SUNDAY: "매주 일요일",
  };
  return dayMap[dayOfWeek] || dayOfWeek;
};

// 시간 포맷팅 (HH:mm:ss -> HH:mm)
const formatTime = (time: string): string => {
  return time.substring(0, 5);
};

export default function MentorApplicationPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [career, setCareer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 수업 가능 시간 관련 상태
  const [availabilities, setAvailabilities] = useState<MentorAvailabilityItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("19:00");
  const [endTime, setEndTime] = useState<string>("21:00");

  // 페이지 진입 시 인증 상태 체크용 (로그아웃 시 알림 방지)
  const hasCheckedAuth = useRef(false);

  // 비로그인 사용자는 로그인 페이지로 리다이렉트 (최초 진입 시에만)
  useEffect(() => {
    if (!isLoading && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      if (!isAuthenticated) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 로딩 중이거나 비인증 상태면 렌더링 하지 않음
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // 가용 시간 추가 핸들러
  const handleAddAvailability = () => {
    if (!selectedDay) {
      alert("요일을 선택해주세요.");
      return;
    }
    if (!startTime || !endTime) {
      alert("시작 시간과 종료 시간을 입력해주세요.");
      return;
    }
    if (startTime >= endTime) {
      alert("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    // 이미 등록된 요일인지 확인
    const existingDay = availabilities.find(a => a.dayOfWeek === selectedDay);
    if (existingDay) {
      alert("이미 등록된 요일입니다. 기존 시간을 삭제 후 다시 추가해주세요.");
      return;
    }

    // 로컬 상태에 임시 추가 (id는 임시값)
    const newAvailability: MentorAvailabilityItem = {
      id: Date.now(), // 임시 ID
      dayOfWeek: selectedDay,
      dayOfWeekKr: getDayLabel(selectedDay),
      startTime: startTime + ":00",
      endTime: endTime + ":00",
      active: true,
    };

    setAvailabilities([...availabilities, newAvailability]);
    setSelectedDay("");
    setStartTime("19:00");
    setEndTime("21:00");
  };

  // 가용 시간 삭제 핸들러
  const handleRemoveAvailability = (id: number) => {
    setAvailabilities(availabilities.filter(a => a.id !== id));
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (skills.length === 0) {
      alert("주요 기술을 최소 1개 이상 추가해주세요.");
      return;
    }
    if (!career.trim()) {
      alert("전문 경력 개요를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. 멘토 신청
      const response = await mentorApi.applyMentor({
        skills,
        career: career.trim(),
      });

      if (response.success) {
        // 사용자 정보 갱신 (역할이 MENTOR로 변경되었을 수 있음)
        await refreshUser();

        // 2. 가용 시간 등록 (있는 경우)
        if (availabilities.length > 0) {
          const availabilityPromises = availabilities.map((availability) =>
            mentorApi.addMyAvailability({
              dayOfWeek: availability.dayOfWeek,
              startTime: availability.startTime.substring(0, 5), // "HH:mm:ss" -> "HH:mm"
              endTime: availability.endTime.substring(0, 5),
            })
          );

          try {
            await Promise.all(availabilityPromises);
          } catch {
            // 가용 시간 등록 실패해도 멘토 신청은 완료됨
          }
        }

        alert("멘토 신청이 완료되었습니다!");
        navigate("/");
      } else {
        alert(response.message || "멘토 신청에 실패했습니다.");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "멘토 신청 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="pt-16">
      <main className="flex-1 flex justify-center py-10 px-4 md:px-0">
        <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-3 mb-4">
                  <div className="bg-primary/20 p-2 rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">
                      workspace_premium
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold">멘토 신청하기</h3>
                    <p className="text-muted-foreground text-xs">
                      5분 안에 신청 완료
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">
                      payments
                    </span>
                    <div>
                      <p className="text-sm font-semibold">수익 창출</p>
                      <p className="text-muted-foreground text-xs">
                        직접 요율을 설정하고 코드 리뷰로 수익을 창출하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">
                      volunteer_activism
                    </span>
                    <div>
                      <p className="text-sm font-semibold">커뮤니티 기여</p>
                      <p className="text-muted-foreground text-xs">
                        여러분의 지혜로 다음 세대 개발자들에게 힘을 실어주세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">
                      public
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        글로벌 영향력 확보
                      </p>
                      <p className="text-muted-foreground text-xs">
                        전 세계 개발자들과 소통하며 개인 브랜드를 구축하세요.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Review Status */}
                <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <span className="material-symbols-outlined text-sm">
                      info
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider">
                      검토 미리보기
                    </p>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                      <div className="w-0.5 h-6 bg-border" />
                      <div className="w-3 h-3 rounded-full bg-border" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-xs">
                        <span className="font-bold block">신청 완료</span>
                        <span className="text-muted-foreground">
                          신청서가 접수되었습니다
                        </span>
                      </div>
                      <div className="text-xs opacity-50">
                        <span className="font-bold block">검토 대기 중</span>
                        <span className="text-muted-foreground">
                          팀에서 포트폴리오를 확인 중입니다
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <span className="material-symbols-outlined">dashboard</span>
                <p className="text-sm font-medium">대시보드</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
                <span className="material-symbols-outlined">description</span>
                <p className="text-sm font-medium">신청 상태</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <span className="material-symbols-outlined">settings</span>
                <p className="text-sm font-medium">설정</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-3">
              <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                멘토 신청하기
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                최고의 개발자 네트워크에 합류하여 1:1 세션과 코드 리뷰를 통해
                다음 세대를 이끌어주세요.
              </p>
            </div>

            {/* Application Form */}
            <Card>
              <CardContent className="p-8 space-y-8">
                {/* Section: Expertise */}
                <section>
                  <CardHeader className="p-0 pb-6 border-b mb-6">
                    <CardTitle className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        school
                      </span>
                      주요 전문 분야
                    </CardTitle>
                  </CardHeader>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label>
                        주요 기술 <span className="text-primary">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="기술 스택을 입력하세요 (예: React, Node.js)"
                          className="h-12 flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleAddSkill}
                          className="h-12 px-6"
                        >
                          <span className="material-symbols-outlined text-lg">
                            add
                          </span>
                          추가
                        </Button>
                      </div>
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          {skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="px-3 py-1.5 text-sm flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:text-blue-800 dark:hover:text-blue-100"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  close
                                </span>
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-muted-foreground text-xs italic">
                        팁: 여러 기술을 추가할 수 있습니다. Enter 키를 눌러도
                        추가됩니다.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section: Career */}
                <section>
                  <CardHeader className="p-0 pb-6 border-b mb-6">
                    <CardTitle className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        work_history
                      </span>
                      경력 사항
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-2">
                    <Label>전문 경력 개요</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-lg">
                            format_bold
                          </span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-lg">
                            format_italic
                          </span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-lg">
                            format_list_bulleted
                          </span>
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-lg">
                            link
                          </span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <span className="material-symbols-outlined text-lg">
                            code
                          </span>
                        </Button>
                      </div>
                      <Textarea
                        value={career}
                        onChange={(e) => setCareer(e.target.value)}
                        placeholder="전문가로서의 여정, 주요 프로젝트, 리더십 경험을 서술해 주세요. 왜 훌륭한 멘토가 될 수 있는지 강조해 보세요..."
                        className="min-h-[180px] border-0 rounded-none focus-visible:ring-0 resize-none"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs italic">
                      팁: 실무에서 사용한 기술들을 구체적으로 작성해 주세요.
                    </p>
                  </div>
                </section>

                {/* Section: Availability */}
                <section>
                  <CardHeader className="p-0 pb-6 border-b mb-6">
                    <CardTitle className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                        schedule
                      </span>
                      수업 가능 시간 설정
                    </CardTitle>
                  </CardHeader>

                  {/* 시간 추가 폼 */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      {/* 요일 선택 */}
                      <div className="space-y-2">
                        <Label>요일 선택</Label>
                        <Select value={selectedDay} onValueChange={setSelectedDay}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="요일 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 시작 시간 */}
                      <div className="space-y-2">
                        <Label>시작 시간</Label>
                        <Select value={startTime} onValueChange={setStartTime}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="시작 시간" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 종료 시간 */}
                      <div className="space-y-2">
                        <Label>종료 시간</Label>
                        <Select value={endTime} onValueChange={setEndTime}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="종료 시간" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 추가 버튼 */}
                      <Button
                        type="button"
                        onClick={handleAddAvailability}
                        className="h-12"
                      >
                        <span className="material-symbols-outlined text-lg mr-1">
                          add
                        </span>
                        추가
                      </Button>
                    </div>

                    {/* 등록된 시간 목록 */}
                    {availabilities.length > 0 && (
                      <div className="space-y-3 mt-6">
                        <Label className="text-base font-semibold">등록된 시간 목록</Label>
                        <div className="space-y-2">
                          {availabilities.map((availability) => (
                            <div
                              key={availability.id}
                              className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                            >
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">
                                  calendar_today
                                </span>
                                <div>
                                  <p className="font-medium text-white">
                                    {getDayLabel(availability.dayOfWeek)}
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAvailability(availability.id)}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <span className="material-symbols-outlined">
                                  delete
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-muted-foreground text-xs italic mt-4">
                      멘티가 신청할 수 있는 구체적인 요일과 시간대를 설정해 주세요.
                    </p>
                  </div>
                </section>
              </CardContent>

              {/* Footer */}
              <div className="px-8 py-6 bg-muted/30 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                  <span className="text-xs">
                    오후 2:02에 임시 저장되었습니다
                  </span>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline">임시 저장</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="min-w-[160px] shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? "제출 중..." : "신청서 제출"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
