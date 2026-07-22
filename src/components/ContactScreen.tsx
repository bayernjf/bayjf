/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, FormEvent, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Link, Code, ArrowRight, Copy, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { submitContactMessage } from '../api/contact';
import { trackEvent } from '../utils/analytics';
import TurnstileWidget from './TurnstileWidget';

export default function ContactScreen() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const status = {
    available: true,
    label: language === 'en' ? 'Currently Accepting Projects' : '当前接受项目合作'
  };
  
  const handleCopyEmail = (email: string) => (e: MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(email)
      .then(() => {
        showToast(
          language === 'en' ? 'Email copied to clipboard!' : '邮箱已复制到剪贴板！',
          'success'
        );
      })
      .catch(() => {
        showToast(
          language === 'en' ? 'Failed to copy email.' : '复制邮箱失败。',
          'error'
        );
      });
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const handleTurnstileError = useCallback(() => setTurnstileToken(''), []);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.errName');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.errEmailReq');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('contact.form.errEmailInvalid');
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.form.errSubject');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.errMessage');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError('');
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast(
        language === 'en' ? 'Please fill in all required fields correctly.' : '请正确填写所有必填项。',
        'error'
      );
      return;
    }
    if (!turnstileToken) {
      showToast(
        language === 'en' ? 'Please complete the human verification.' : '请先完成安全验证。',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await submitContactMessage({ ...formData, turnstileToken });
      setIsSubmitting(false);
      setIsSuccess(true);
      trackEvent('contact_form_submit', { status: 'success' });
      showToast(
        language === 'en' ? 'Message sent successfully!' : '留言发送成功！',
        'success'
      );
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTurnstileToken('');
      setErrors({});
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      setIsSubmitting(false);
      setIsSuccess(false);
      trackEvent('contact_form_submit', { status: 'error' });
      const errorName = error instanceof Error ? error.name : '';
      const errorMessage = error instanceof Error ? error.message : '';
      const message = errorName === 'TimeoutError' || errorName === 'AbortError'
        ? (language === 'en' ? 'The request timed out. Please check that the API service is running and try again.' : '请求超时，请确认 API 服务已启动后重试。')
        : errorMessage === 'Human verification failed.' || errorMessage === 'VERIFICATION_FAILED'
          ? (language === 'en' ? 'Human verification failed. Please complete it again.' : '安全验证失败，请重新完成验证。')
          : errorMessage === 'Unable to send message right now.' || errorMessage === 'INTERNAL_ERROR'
            ? (language === 'en' ? 'The message service is temporarily unavailable. Please try again later.' : '留言服务暂时不可用，请稍后重试。')
            : (language === 'en' ? 'Unable to connect to the message service. Please start the local API and try again.' : '无法连接留言服务，请启动本地 API 后重试。');
      setSubmitError(message);
    }
  };

  return (
    <div className="relative pt-32 pb-24 min-h-screen px-6 md:px-16 max-w-7xl mx-auto flex items-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#54615b]/10 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 w-full items-center">
        {/* Left Column: Information */}
        <div className="md:col-span-5 flex flex-col justify-center pr-0 md:pr-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Live Availability Status Indicator */}
            <div className="inline-flex flex-col mb-8 gap-2">
              <div className="flex items-center gap-1">
                <div className="flex items-center px-3 py-1.5 rounded-full bg-[#e4e2e0]/40 dark:bg-white/5 border border-[#e4e2e0]/60 dark:border-white/5 text-xs font-sans tracking-wide">
                  <span className="relative flex h-2 w-2 mr-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.available ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${status.available ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  </span>
                  <span className="font-semibold text-[#1b1c1b] dark:text-[#fbf9f7] mr-2">
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mb-8 leading-tight">
              {t('contact.title')}
            </h1>
            <p className="font-sans text-lg text-[#444748] dark:text-[#c4c7c7] mb-12 max-w-md leading-relaxed">
              {t('contact.desc')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Email link with Mail icon */}
            {['bayernjf@163.com', 'b4yernjf@gmail.com'].map((email, index) => (
              <div key={email} className="flex items-center gap-2">
                <a
                  id={`contact-email-link-${index}`}
                  href={`mailto:${email}`}
                  className="interactive inline-flex items-center gap-4 text-xl md:text-2xl font-serif text-[#1b1c1b] dark:text-[#fbf9f7] hover:text-[#54615b] dark:hover:text-[#bbcac2] transition-colors group"
                >
                  <span className="p-3 bg-[#e4e2e0]/50 dark:bg-white/5 rounded-full text-[#54615b] dark:text-[#bbcac2] group-hover:scale-110 transition-transform duration-300">
                    <Mail size={22} />
                  </span>
                  {email}
                </a>
                <button
                  id={`contact-email-copy-btn-${index}`}
                  onClick={handleCopyEmail(email)}
                  className="interactive p-2.5 bg-[#e4e2e0]/40 dark:bg-white/5 text-[#444748] dark:text-[#c4c7c7] hover:text-[#54615b] dark:hover:text-[#bbcac2] hover:bg-[#e4e2e0] dark:hover:bg-white/10 rounded-full transition-all duration-300 ml-2 shadow-sm hover:scale-110"
                  title={language === 'en' ? `Copy ${email}` : `复制 ${email}`}
                  aria-label={language === 'en' ? `Copy ${email}` : `复制 ${email}`}
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}

            {/* Social icons */}
            <div className="flex gap-4 mt-8">
              <a
                id="social-link-web"
                href="https://github.com/bayernjf"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#e4e2e0]/40 dark:bg-white/5 text-[#444748] dark:text-[#c4c7c7] hover:text-[#54615b] dark:hover:text-[#bbcac2] hover:bg-[#e4e2e0] dark:hover:bg-white/10 rounded-full transition-all duration-300 scale-100 hover:scale-110"
              >
                <Link size={20} />
              </a>
              <a
                id="social-link-code"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#e4e2e0]/40 dark:bg-white/5 text-[#444748] dark:text-[#c4c7c7] hover:text-[#54615b] dark:hover:text-[#bbcac2] hover:bg-[#e4e2e0] dark:hover:bg-white/10 rounded-full transition-all duration-300 scale-100 hover:scale-110"
              >
                <Code size={20} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="md:col-span-6 md:col-start-7 relative">
          {/* Subtle glow behind card */}
          <div className="absolute -inset-4 bg-[#54615b]/5 dark:bg-[#54615b]/10 rounded-3xl blur-2xl -z-10" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#fbf9f7] dark:bg-[#161716] p-8 md:p-12 rounded-3xl border border-[#e4e2e0] dark:border-white/5 shadow-2xl transition-all duration-500 hover:border-[#54615b]/20"
          >
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <span className="text-4xl">✨</span>
                <h3 className="font-serif text-2xl font-bold text-[#1b1c1b] dark:text-[#fbf9f7] mt-4 mb-2">
                  {t('contact.form.successHeader')}
                </h3>
                <p className="font-sans text-sm text-[#444748] dark:text-[#c4c7c7] max-w-sm mx-auto">
                  {t('contact.form.successSub')}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
                {/* Inputs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name Input */}
                  <div className="flex flex-col">
                    <div className="relative group">
                      <input
                        id="form-name"
                        type="text"
                        placeholder={t('contact.form.namePlaceholder')}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`contact-field w-full bg-transparent border-b py-3 text-sm text-[#1b1c1b] dark:text-[#fbf9f7] placeholder-[#444748]/60 dark:placeholder-[#c4c7c7]/75 focus:outline-none transition-colors duration-300 ${
                          errors.name
                            ? 'border-rose-500 dark:border-rose-400 focus:border-rose-600 dark:focus:border-rose-400'
                            : 'border-[#e4e2e0] dark:border-white/10 focus:border-[#54615b] dark:focus:border-[#bbcac2]'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <span className="text-[11px] font-sans text-rose-500 dark:text-rose-400 tracking-wide mt-1.5 transition-all animate-in fade-in slide-in-from-top-1">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col">
                    <div className="relative group">
                      <input
                        id="form-email"
                        type="email"
                        placeholder={t('contact.form.emailPlaceholder')}
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`contact-field w-full bg-transparent border-b py-3 text-sm text-[#1b1c1b] dark:text-[#fbf9f7] placeholder-[#444748]/60 dark:placeholder-[#c4c7c7]/75 focus:outline-none transition-colors duration-300 ${
                          errors.email
                            ? 'border-rose-500 dark:border-rose-400 focus:border-rose-600 dark:focus:border-rose-400'
                            : 'border-[#e4e2e0] dark:border-white/10 focus:border-[#54615b] dark:focus:border-[#bbcac2]'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <span className="text-[11px] font-sans text-rose-500 dark:text-rose-400 tracking-wide mt-1.5 transition-all animate-in fade-in slide-in-from-top-1">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div className="flex flex-col">
                  <div className="relative group">
                    <input
                      id="form-subject"
                      type="text"
                      placeholder={t('contact.form.subjectPlaceholder')}
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className={`contact-field w-full bg-transparent border-b py-3 text-sm text-[#1b1c1b] dark:text-[#fbf9f7] placeholder-[#444748]/60 dark:placeholder-[#c4c7c7]/75 focus:outline-none transition-colors duration-300 ${
                        errors.subject
                          ? 'border-rose-500 dark:border-rose-400 focus:border-rose-600 dark:focus:border-rose-400'
                          : 'border-[#e4e2e0] dark:border-white/10 focus:border-[#54615b] dark:focus:border-[#bbcac2]'
                      }`}
                    />
                  </div>
                  {errors.subject && (
                    <span className="text-[11px] font-sans text-rose-500 dark:text-rose-400 tracking-wide mt-1.5 transition-all animate-in fade-in slide-in-from-top-1">
                      {errors.subject}
                    </span>
                  )}
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col">
                  <div className="relative group">
                    <textarea
                      id="form-message"
                      rows={4}
                      placeholder={t('contact.form.messagePlaceholder')}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={`contact-field w-full bg-transparent border-b py-3 text-sm text-[#1b1c1b] dark:text-[#fbf9f7] placeholder-[#444748]/60 dark:placeholder-[#c4c7c7]/75 focus:outline-none transition-colors duration-300 resize-none ${
                        errors.message
                          ? 'border-rose-500 dark:border-rose-400 focus:border-rose-600 dark:focus:border-rose-400'
                          : 'border-[#e4e2e0] dark:border-white/10 focus:border-[#54615b] dark:focus:border-[#bbcac2]'
                      }`}
                    />
                  </div>
                  {errors.message && (
                    <span className="text-[11px] font-sans text-rose-500 dark:text-rose-400 tracking-wide mt-1.5 transition-all animate-in fade-in slide-in-from-top-1">
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                {submitError && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl border border-rose-300/60 dark:border-rose-400/30 bg-rose-50/90 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
                  >
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
                    <span>{submitError}</span>
                  </div>
                )}
                {turnstileSiteKey ? (
                  <TurnstileWidget
                    siteKey={turnstileSiteKey}
                    onToken={setTurnstileToken}
                    onError={handleTurnstileError}
                  />
                ) : (
                  <p className="text-xs text-rose-500">{language === 'en' ? 'Human verification is not configured.' : '安全验证尚未配置。'}</p>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    id="form-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="interactive bg-[#1b1c1b] dark:bg-[#fbf9f7] hover:bg-[#54615b] dark:hover:bg-[#bbcac2] text-[#fbf9f7] dark:text-[#1b1c1b] disabled:opacity-50 font-sans text-xs uppercase font-bold tracking-widest px-8 py-4 rounded-full flex items-center gap-3 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-300"
                  >
                    {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
