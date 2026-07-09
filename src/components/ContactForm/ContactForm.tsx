import { useState } from 'react'
import { useForm } from 'react-hook-form'
import emailjs from '@emailjs/browser'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      setStatus('error')
      return
    }

    setStatus('loading')

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          message: data.message,
        },
        publicKey,
      )
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-xs tracking-[0.15em] uppercase mb-2">
            Nome
          </label>
          <input
            id="name"
            type="text"
            className="input-field"
            placeholder="Seu nome completo"
            {...register('name', { required: 'Nome é obrigatório' })}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase mb-2">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="seu@email.com"
            {...register('email', {
              required: 'E-mail é obrigatório',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'E-mail inválido',
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs tracking-[0.15em] uppercase mb-2">
          Telefone
        </label>
        <input
          id="phone"
          type="tel"
          className="input-field"
          placeholder="(00) 00000-0000"
          {...register('phone', { required: 'Telefone é obrigatório' })}
        />
        {errors.phone && (
          <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-xs tracking-[0.15em] uppercase mb-2">
          Mensagem
        </label>
        <textarea
          id="message"
          rows={5}
          className="input-field resize-none"
          placeholder="Conte-nos sobre seu projeto..."
          {...register('message', { required: 'Mensagem é obrigatória' })}
        />
        {errors.message && (
          <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full md:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar mensagem'
        )}
      </button>

      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3">
          <CheckCircle size={18} />
          Mensagem enviada com sucesso! Entraremos em contato em breve.
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>
            Não foi possível enviar a mensagem. Verifique se as credenciais do EmailJS
            estão configuradas no arquivo <code className="text-xs">.env</code>.
          </span>
        </div>
      )}
    </form>
  )
}
