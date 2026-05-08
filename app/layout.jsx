import './globals.css'
import { Inter, Poppins } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets:['latin'], variable:'--font-inter' })
const poppins = Poppins({ subsets:['latin'], weight:['500','600','700','800'], variable:'--font-poppins' })

export const metadata = {
  title: 'Chinmaya Vidyalaya LMS | Class X & XII Computer Science',
  description: 'Learning portal for Chinmaya Vidyalaya NTPC Unchahar students',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-slate-50 text-slate-900 antialiased font-['Inter',sans-serif]">
        <SessionProvider session={session}>
          {children}
          <Toaster position="top-right" toastOptions={{ style:{ fontSize:'13px', fontFamily:'Inter,sans-serif' }, success:{ iconTheme:{ primary:'#0ea5e9', secondary:'#fff' } } }} />
        </SessionProvider>
      </body>
    </html>
  )
}
