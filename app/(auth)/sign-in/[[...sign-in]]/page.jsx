import { SignIn } from '@clerk/nextjs'

// Page component for rendering the SignIn form
export default function Page() {
  return(<div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  }}>
    <SignIn /> {/* Render the Clerk SignIn component */}
  </div>); 
}