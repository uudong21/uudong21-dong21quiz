import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  PlayCircle, 
  User, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ChevronRight, 
  Lock, 
  LogIn, 
  Edit3, 
  BarChart3, 
  Settings,
  ClipboardCheck,
  Compass,
  Plus,
  Trash2,
  Save,
  ArrowLeft
} from 'lucide-react';
import { AppScreen, QuizQuestion, QuizOption, QuizResult } from './types';
import { MOCK_QUESTIONS, LOGO_URL, CHARACTER_IMAGE_URL } from './constants';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    const saved = localStorage.getItem('quiz_questions');
    if (saved) {
      const parsed = JSON.parse(saved);
      // If the saved questions are the old mock data (length 3), update to the new 15 questions
      if (parsed.length === 3) return MOCK_QUESTIONS;
      return parsed;
    }
    return MOCK_QUESTIONS;
  });
  const [correctAnswerIds, setCorrectAnswerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('user_correct_answers');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [password, setPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminSubScreen, setAdminSubScreen] = useState<'dashboard' | 'edit'>('dashboard');
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  useEffect(() => {
    // Check for question ID in URL (e.g., ?q=1)
    const params = new URLSearchParams(window.location.search);
    const questionId = params.get('q');
    
    if (questionId) {
      const index = questions.findIndex(q => q.id === questionId);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
        setScreen('quiz');
      }
    }
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('quiz_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('user_correct_answers', JSON.stringify(correctAnswerIds));
  }, [correctAnswerIds]);

  useEffect(() => {
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      buffer += e.key;
      if (buffer.endsWith('ert')) {
        setScreen('admin');
        buffer = '';
      }
      if (buffer.length > 10) buffer = buffer.substring(1);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (correctAnswerIds.length / questions.length) * 100;

  const handleStart = () => {
    if (questions.length === 0) return;
    setScreen('quiz');
  };

  const handleAnswer = (option: QuizOption) => {
    const isCorrect = option === currentQuestion.answer;
    if (isCorrect && !correctAnswerIds.includes(currentQuestion.id)) {
      setCorrectAnswerIds(prev => [...prev, currentQuestion.id]);
    }
    setLastResult({ isCorrect, question: currentQuestion });
    setScreen('result');
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setScreen('quiz');
    } else {
      setScreen('home');
      setCurrentQuestionIndex(0);
    }
  };

  const handleAdminLogin = () => {
    if (password === '1234') {
      setIsAdminLoggedIn(true);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '새로운 질문을 입력하세요',
      answer: 'O',
      explanation: '해설을 입력하세요',
    };
    setQuestions(prev => [...prev, newQuestion]);
    setEditingQuestion(newQuestion);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (editingQuestion?.id === id) setEditingQuestion(null);
  };

  const handleUpdateQuestion = (updated: QuizQuestion) => {
    setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
    setEditingQuestion(null);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center w-full max-w-lg px-8 py-12"
          >
            <div className="w-full neumorphic-flat rounded-3xl p-10 flex flex-col items-center text-center space-y-12">
              <div className="relative">
                <div className="w-48 h-48 rounded-full neumorphic-inset flex items-center justify-center overflow-hidden p-4">
                  <img 
                    src={CHARACTER_IMAGE_URL} 
                    alt="호이 캐릭터" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback if local image is not found
                      (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/adventurer/svg?seed=Hoi&backgroundColor=b6e3f4";
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-on-surface leading-tight">
                  호이QR코드를 찾아<br/>
                  <span className="text-primary-container">퀴즈를 풀어보세요!</span>
                </h1>
              </div>

              <div className="w-full space-y-3">
                <div className="flex justify-between items-end px-1">
                  <span className="text-sm font-bold text-on-surface-variant">나의 정답 현황</span>
                  <span className="text-lg font-black text-primary">{correctAnswerIds.length} <span className="text-xs font-medium text-on-surface-variant">/ {questions.length}</span></span>
                </div>
                <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="h-full bg-primary-container rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,160,201,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-secondary font-bold animate-pulse">
                  주변의 호이QR코드를 찾아 스캔해 주세요!
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 'quiz':
        if (!currentQuestion) return null;
        return (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-4xl px-6 py-12 flex flex-col items-center space-y-12"
          >
            <div className="w-full max-w-md h-4 bg-slate-200/50 neumorphic-inset rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-primary-container rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,160,201,0.5)]"
                style={{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }}
              ></div>
            </div>

            <section className="w-full bg-surface-container rounded-[2.5rem] p-12 md:p-20 neumorphic-raised relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary-container"></div>
              <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl font-sans font-bold text-on-surface leading-tight tracking-tight">
                  {currentQuestion.question}
                </h1>
                <p className="text-lg text-outline font-medium">정답을 선택해 주세요!</p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 w-full">
              <button 
                onClick={() => handleAnswer('O')}
                className="group relative flex flex-col items-center justify-center p-14 bg-surface-container rounded-[2.5rem] neumorphic-raised hover:scale-[1.03] active:scale-95 transition-all duration-300"
              >
                <span className="text-[140px] leading-none font-sans font-black text-primary-container transition-transform duration-500 group-hover:scale-110 drop-shadow-lg">O</span>
                <span className="mt-4 text-2xl font-extrabold font-sans text-primary-container">맞습니다</span>
              </button>
              <button 
                onClick={() => handleAnswer('X')}
                className="group relative flex flex-col items-center justify-center p-14 bg-surface-container rounded-[2.5rem] neumorphic-raised hover:scale-[1.03] active:scale-95 transition-all duration-300"
              >
                <span className="text-[140px] leading-none font-sans font-black text-error transition-transform duration-500 group-hover:scale-110 drop-shadow-lg">X</span>
                <span className="mt-4 text-2xl font-extrabold font-sans text-error">틀립니다</span>
              </button>
            </div>

            <div className="flex items-center gap-3 px-8 py-4 bg-surface-container-low rounded-full neumorphic-inset text-outline text-sm font-bold opacity-80">
              <Info className="w-4 h-4" />
              <span>도움말: 동구 청년 기본 조례를 확인해보세요</span>
            </div>
          </motion.div>
        );

      case 'result':
        if (!lastResult) return null;
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-2xl px-6 py-4 flex flex-col items-center space-y-8"
          >
            <div className="w-full neumorphic-flat rounded-[2.5rem] flex flex-col items-center text-center space-y-8 py-16 px-10">
              <div className="w-24 h-24 rounded-full neumorphic-inset flex items-center justify-center">
                {lastResult.isCorrect ? (
                  <span className="text-primary-container text-6xl font-black">O</span>
                ) : (
                  <span className="text-error text-6xl font-black">X</span>
                )}
              </div>
              
              <div className="space-y-4">
                <h2 className={`text-[64px] font-sans font-extrabold leading-tight ${lastResult.isCorrect ? 'text-primary-container' : 'text-error'}`}>
                  {lastResult.isCorrect ? '정답입니다!' : '오답입니다'}
                </h2>
                <h1 className="text-xl md:text-2xl font-sans font-bold text-on-surface leading-tight px-4">
                  {lastResult.question.question}
                </h1>
              </div>

              <div className="w-full space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-2xl font-bold text-on-surface-variant">정답:</span>
                  <span className={`text-6xl font-black ${lastResult.question.answer === 'O' ? 'text-primary-container' : 'text-error'}`}>
                    {lastResult.question.answer}
                  </span>
                </div>
                
                <div className="bg-surface-container-low rounded-3xl neumorphic-inset p-10">
                  <p className="text-on-surface-variant leading-snug text-2xl font-extrabold">
                    {lastResult.question.explanation}
                  </p>
                </div>
              </div>

              <div className="w-full pt-8">
                <button 
                  onClick={() => setScreen('home')}
                  className="w-full text-center group"
                >
                  <p className="text-primary-container font-black text-2xl group-hover:scale-105 transition-transform">
                    호이QR코드를 찾아보세요!
                  </p>
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'fail':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg px-6 flex flex-col items-center justify-center py-12"
          >
            <section className="w-full neumorphic-flat rounded-lg p-10 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full neumorphic-inset flex items-center justify-center mb-8 overflow-hidden p-3">
                <img 
                  src={CHARACTER_IMAGE_URL} 
                  alt="호이 캐릭터" 
                  className="w-full h-full object-contain grayscale"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback if local image is not found
                    (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/adventurer/svg?seed=Hoi&backgroundColor=b6e3f4";
                  }}
                />
              </div>
              <h2 className="font-sans font-extrabold text-3xl text-on-surface mb-6 tracking-tight">
                꽝! 아쉬워요.
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed font-medium">
                이번 호이QR코드는 꽝입니다.<br/>
                다른 호이QR코드를 찾아 퀴즈를 풀어보세요!
              </p>
              <div className="mt-12 w-full h-1 neumorphic-inset rounded-full opacity-50"></div>
              <button 
                onClick={() => setScreen('home')}
                className="mt-8 neumorphic-button px-8 py-3 rounded-full font-bold text-primary"
              >
                홈으로 돌아가기
              </button>
            </section>
          </motion.div>
        );

      case 'admin':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-7xl px-6 py-12"
          >
            <section className="mb-16 text-center">
              <h1 className="font-sans text-5xl font-extrabold text-on-background tracking-tighter mb-4">관리자 설정</h1>
              <p className="text-secondary font-medium">시스템 보안을 위해 관리자 권한 확인이 필요합니다.</p>
            </section>

            {!isAdminLoggedIn ? (
              <div className="flex justify-center">
                <div className="w-full max-w-md bg-surface-container-low rounded-xl p-10 neumorphic-raised border border-white/20">
                  <div className="flex flex-col gap-8">
                    <div className="space-y-4">
                      <label className="font-body font-bold text-on-surface-variant block ml-2">관리자 비밀번호를 입력해 주세요.</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-surface-container neumorphic-inset border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary-container transition-all placeholder:text-outline-variant" 
                          placeholder="••••••••" 
                        />
                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                      </div>
                    </div>
                    <button 
                      onClick={handleAdminLogin}
                      className="w-full py-4 bg-primary-container text-on-surface font-bold rounded-full neumorphic-raised flex justify-center items-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      <span>로그인</span>
                      <LogIn className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {adminSubScreen === 'dashboard' ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                    <div className="md:col-span-4 bg-surface-container-low rounded-xl p-10 neumorphic-raised border border-white/20 text-center">
                      <CheckCircle2 className="w-16 h-16 text-primary-container mx-auto mb-4" />
                      <h3 className="text-xl font-bold">인증되었습니다</h3>
                      <button 
                        onClick={() => setIsAdminLoggedIn(false)}
                        className="mt-4 text-sm text-secondary underline"
                      >
                        로그아웃
                      </button>
                    </div>

                    <div className="md:col-span-8 space-y-8">
                      <div className="grid grid-cols-1 gap-6">
                        <div 
                          onClick={() => setAdminSubScreen('edit')}
                          className="group relative bg-surface p-8 rounded-xl neumorphic-raised border border-white/40 hover:bg-surface-container-highest transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-primary-fixed neumorphic-raised flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Edit3 className="w-8 h-8" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-sans text-xl font-bold text-on-surface">문제 수정</h3>
                              <p className="text-on-surface-variant text-sm mt-1">퀴즈 문항 관리, 정답 설정 및 새로운 문제 추가</p>
                            </div>
                            <ChevronRight className="text-outline group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                        
                        <div className="group relative bg-surface p-8 rounded-xl neumorphic-raised border border-white/40 hover:bg-surface-container-highest transition-all duration-300 cursor-pointer opacity-50">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-secondary-fixed neumorphic-raised flex items-center justify-center text-primary">
                              <BarChart3 className="w-8 h-8" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-sans text-xl font-bold text-on-surface">참여자 통계 (준비중)</h3>
                              <p className="text-on-surface-variant text-sm mt-1">실시간 참여 현황 및 데이터 리포트</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setAdminSubScreen('dashboard')}
                        className="flex items-center gap-2 text-primary font-bold neumorphic-button px-6 py-3 rounded-full"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span>대시보드로</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('모든 문제를 초기화하고 기본 문제(15문항)를 불러오시겠습니까?')) {
                            setQuestions(MOCK_QUESTIONS);
                            setEditingQuestion(null);
                          }
                        }}
                        className="flex items-center gap-2 text-on-surface-variant font-bold neumorphic-button px-6 py-3 rounded-full"
                      >
                        <span>초기화</span>
                      </button>
                      <button 
                        onClick={handleAddQuestion}
                        className="flex items-center gap-2 bg-primary-container text-on-surface font-bold neumorphic-raised px-6 py-3 rounded-full"
                      >
                        <Plus className="w-5 h-5" />
                        <span>문제 추가</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        {questions.map((q, idx) => (
                          <div 
                            key={q.id}
                            className={`p-6 rounded-2xl neumorphic-flat border-2 transition-all cursor-pointer ${editingQuestion?.id === q.id ? 'border-primary-container' : 'border-transparent'}`}
                            onClick={() => setEditingQuestion(q)}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-grow">
                                <span className="text-xs font-bold text-primary-container mb-1 block">Q{idx + 1}</span>
                                <p className="font-bold text-on-surface line-clamp-2">{q.question}</p>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteQuestion(q.id);
                                }}
                                className="text-error hover:scale-110 transition-transform"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-surface-container-low rounded-[2.5rem] p-10 neumorphic-raised border border-white/20 h-fit sticky top-24">
                        {editingQuestion ? (
                          <div className="space-y-6">
                            <h3 className="text-2xl font-black text-on-surface">문제 편집</h3>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant ml-2">질문 내용</label>
                              <textarea 
                                value={editingQuestion.question}
                                onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                                className="w-full bg-surface-container neumorphic-inset border-none rounded-2xl px-6 py-4 min-h-[100px] focus:ring-2 focus:ring-primary-container transition-all"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant ml-2">정답 설정</label>
                              <div className="flex gap-4">
                                {(['O', 'X'] as QuizOption[]).map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => setEditingQuestion({...editingQuestion, answer: opt})}
                                    className={`flex-1 py-4 rounded-2xl font-black text-2xl transition-all ${editingQuestion.answer === opt ? (opt === 'O' ? 'bg-primary-container text-on-surface shadow-[0_0_15px_rgba(0,160,201,0.4)] scale-105 border-2 border-primary' : 'bg-error text-on-surface shadow-[0_0_15px_rgba(186,26,26,0.4)] scale-105 border-2 border-red-800') : 'bg-surface-container text-on-surface-variant neumorphic-inset opacity-60'}`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant ml-2">해설 입력</label>
                              <textarea 
                                value={editingQuestion.explanation}
                                onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                                className="w-full bg-surface-container neumorphic-inset border-none rounded-2xl px-6 py-4 min-h-[100px] focus:ring-2 focus:ring-primary-container transition-all"
                              />
                            </div>

                            <div className="p-4 bg-surface-container-low rounded-2xl neumorphic-inset border border-white/10">
                              <label className="text-[10px] font-bold text-primary-container uppercase tracking-widest mb-1 block">호이QR코드용 다이렉트 링크</label>
                              <code className="text-xs text-on-surface-variant break-all select-all">
                                {window.location.origin}/?q={editingQuestion.id}
                              </code>
                            </div>

                            <button 
                              onClick={() => handleUpdateQuestion(editingQuestion)}
                              className="w-full py-5 bg-primary-container text-on-surface font-bold rounded-2xl neumorphic-raised flex justify-center items-center gap-3 hover:scale-[1.02] transition-transform mt-4"
                            >
                              <Save className="w-6 h-6" />
                              <span>변경사항 저장</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-20 h-20 rounded-full neumorphic-inset flex items-center justify-center text-outline">
                              <Edit3 className="w-10 h-10" />
                            </div>
                            <p className="text-on-surface-variant font-medium">편집할 문제를 목록에서 선택하거나<br/>새로운 문제를 추가해 주세요.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Header */}
      <header className="w-full top-0 sticky z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-6 py-5 max-w-full">
        <div className="flex items-center cursor-pointer" onClick={() => setScreen('home')}>
          <img 
            src={LOGO_URL} 
            alt="유유기지 동구청년 21" 
            className="h-8 md:h-10 object-contain" 
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setScreen('admin')}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${screen === 'admin' ? 'neumorphic-inset text-primary' : 'neumorphic-button text-primary'}`}
            title="관리자 설정"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center w-full pb-12">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>
      
      {/* Footer for Admin */}
      {screen === 'admin' && (
        <footer className="w-full bg-surface-container-low py-12 mt-auto border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center px-8 w-full max-w-7xl mx-auto gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="font-body text-sm text-secondary">© 2024 Yuyu Giji Dong-gu Youth 21. All rights reserved.</p>
              <div className="flex gap-6 mt-2">
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Help Center</a>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
