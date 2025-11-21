import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className='pb-24 pt-40'>
      <div className='container flex items-center justify-center'>
        <SignUp />
      </div>
    </section>
  )
}
