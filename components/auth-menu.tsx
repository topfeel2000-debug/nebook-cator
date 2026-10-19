'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, LoaderCircle, LogOut, UserRound, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase, supabaseAuthConfigured } from '../lib/supabase-browser';
import type { Language } from '../lib/catalog';

type AuthMode = 'signin' | 'signup';

const copy: Record<Language, {
  signin: string; signup: string; signout: string; email: string; password: string;
  name: string; submit: string; close: string; switchSignin: string; switchSignup: string;
  titleSignin: string; titleSignup: string; setup: string; confirmation: string;
  signedUp: string; genericError: string; invalidEmail: string; shortPassword: string;
}> = {
  ko: { signin:'로그인', signup:'회원가입', signout:'로그아웃', email:'이메일', password:'비밀번호', name:'이름', submit:'계속', close:'닫기', switchSignin:'이미 계정이 있나요? 로그인', switchSignup:'계정이 없으신가요? 회원가입', titleSignin:'다시 만나 반가워요', titleSignup:'네북케이터 시작하기', setup:'Supabase 공개 URL과 Publishable Key 설정이 필요합니다.', confirmation:'가입 확인 메일을 보냈습니다. 이메일에서 인증을 완료해 주세요.', signedUp:'가입이 완료되었습니다.', genericError:'요청을 처리하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.', invalidEmail:'올바른 이메일 주소를 입력해 주세요.', shortPassword:'비밀번호는 6자 이상 입력해 주세요.' },
  en: { signin:'Log in', signup:'Sign up', signout:'Log out', email:'Email', password:'Password', name:'Name', submit:'Continue', close:'Close', switchSignin:'Already have an account? Log in', switchSignup:'New to Nebukator? Sign up', titleSignin:'Welcome back', titleSignup:'Join Nebukator', setup:'Supabase public URL and publishable key are required.', confirmation:'We sent a confirmation email. Verify your address to finish signing up.', signedUp:'Your account is ready.', genericError:'Could not complete that request. Check your details and try again.', invalidEmail:'Enter a valid email address.', shortPassword:'Use a password with at least 6 characters.' },
  zh: { signin:'登录', signup:'注册', signout:'退出登录', email:'电子邮件', password:'密码', name:'姓名', submit:'继续', close:'关闭', switchSignin:'已有账号？登录', switchSignup:'还没有账号？注册', titleSignin:'欢迎回来', titleSignup:'加入 Nebukator', setup:'需要设置 Supabase 公共 URL 和 Publishable Key。', confirmation:'确认邮件已发送。请验证邮箱以完成注册。', signedUp:'注册完成。', genericError:'无法完成请求。请检查输入后重试。', invalidEmail:'请输入有效的电子邮件地址。', shortPassword:'密码至少需要 6 个字符。' },
  vi: { signin:'Đăng nhập', signup:'Đăng ký', signout:'Đăng xuất', email:'Email', password:'Mật khẩu', name:'Tên', submit:'Tiếp tục', close:'Đóng', switchSignin:'Đã có tài khoản? Đăng nhập', switchSignup:'Chưa có tài khoản? Đăng ký', titleSignin:'Chào mừng trở lại', titleSignup:'Tham gia Nebukator', setup:'Cần cấu hình URL công khai và Publishable Key của Supabase.', confirmation:'Đã gửi email xác nhận. Hãy xác minh email để hoàn tất đăng ký.', signedUp:'Đăng ký thành công.', genericError:'Không thể hoàn tất yêu cầu. Hãy kiểm tra thông tin và thử lại.', invalidEmail:'Hãy nhập địa chỉ email hợp lệ.', shortPassword:'Mật khẩu cần có ít nhất 6 ký tự.' },
};

export default function AuthMenu({ lang }: { lang: Language }) {
  const labels = copy[lang];
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  function open(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setMessage('');
    setBusy(true);
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() || undefined },
            emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
          },
        })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) {
        setMessage(labels.confirmation);
      } else {
        setMessage(labels.signedUp);
        setMode(null);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : labels.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setMessage(error?.message ?? '');
    setBusy(false);
  }

  return <>
    {user ? <div className="auth-account">
      <span className="auth-user" title={user.email ?? undefined}><UserRound size={15}/><span>{user.user_metadata?.display_name || user.email}</span></span>
      <button className="auth-action auth-signout" onClick={signOut} disabled={busy} aria-label={labels.signout} title={labels.signout}><LogOut size={16}/></button>
    </div> : <div className="auth-menu">
      <button className="auth-action auth-signin" onClick={() => open('signin')}>{labels.signin}</button>
      <button className="auth-action auth-signup" onClick={() => open('signup')}>{labels.signup}<ArrowRight size={14}/></button>
    </div>}

    {mode && <div className="auth-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setMode(null); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={() => setMode(null)} aria-label={labels.close}><X size={18}/></button>
        <span className="auth-eyebrow">NEBUKATOR · LAW LIBRARY</span>
        <h2 id="auth-title">{mode === 'signin' ? labels.titleSignin : labels.titleSignup}</h2>
        <p className="auth-subtitle">{mode === 'signin' ? labels.signin : labels.signup}</p>
        {!supabaseAuthConfigured ? <p className="auth-message" role="status">{labels.setup}</p> : <form onSubmit={submit}>
          {mode === 'signup' && <label className="auth-field"><span>{labels.name}</span><input autoComplete="name" value={displayName} onChange={event => setDisplayName(event.target.value)} /></label>}
          <label className="auth-field"><span>{labels.email}</span><input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
          <label className="auth-field"><span>{labels.password}</span><input type="password" required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} /></label>
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="auth-submit" disabled={busy}>{busy && <LoaderCircle size={16} className="auth-spinner"/>}{labels.submit}<ArrowRight size={16}/></button>
        </form>}
        <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }}>{mode === 'signin' ? labels.switchSignup : labels.switchSignin}</button>
      </section>
    </div>}
  </>;
}
