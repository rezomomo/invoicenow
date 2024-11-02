import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, MapPin, RefreshCw, Search, Mail, FileText } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-24 flex items-center">
        <Link className="flex items-center justify-center h-full" to="/">
          <span className="text-2xl font-bold text-blue-600">InvoiceNow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#contact">
            Contact
          </a>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-blue-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Takealot Invoice Generator
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Streamline your Takealot invoicing process with our simple and secure invoice generator.
                </p>
              </div>
              <div className="space-x-4">
                <Button onClick={handleGetStarted}>Get Started</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Key Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold">Browse Invoices</h3>
                <p className="text-sm text-gray-500">Easily view and manage your open and closed invoices.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Lock className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold">Secure Credentials</h3>
                <p className="text-sm text-gray-500">Your API key credentials are always kept secure.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold">Update Address</h3>
                <p className="text-sm text-gray-500">Easily update invoice addresses as needed.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RefreshCw className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold">One-Click Generation</h3>
                <p className="text-sm text-gray-500">Generate and preview invoices with a single click.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Search className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold">Fetch Any Invoice</h3>
                <p className="text-sm text-gray-500">Quickly retrieve any invoice using its number.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RefreshCw className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-bold">Built for Takealot</h3>
                <p className="text-sm text-gray-500">10x your invoice request tasks with our Takealot-specific solution.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to streamline your invoicing?</h2>
                <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                  Sign up now and experience the power of automated Takealot invoice generation.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2" onSubmit={handleSignUp}>
                  <Input className="max-w-lg flex-1 bg-white text-gray-900" placeholder="Enter your email" type="email" />
                  <Button className="bg-white text-blue-600 hover:bg-blue-50" type="submit">
                    Sign Up
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contact Us</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Have questions or need support? We're here to help!
                </p>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Mail className="h-6 w-6" />
                <a href="mailto:rbibihos199@gmail.com" className="text-lg hover:underline">
                  rbibihos199@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 InvoiceNow. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" to="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" to="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}