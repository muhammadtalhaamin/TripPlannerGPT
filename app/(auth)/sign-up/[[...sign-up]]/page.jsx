import { SignUp } from '@clerk/nextjs'

// Page component for rendering the SignUp form
export default function Page() {
  return (<div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  }}>
   <SignUp/> {/* Render the Clerk SignUp component */}
  </div>); 
}