import { redirect } from 'next/navigation'

// se a pessoa já estiver logada a tela de login redireciona pra garagem
export default function Home() {
  redirect('/login')
}
