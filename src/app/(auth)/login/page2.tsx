import Image from "next/image";

export default function Login() {
  return (
    <div className="w-[100%] h-[100vh] relative bg-sky-600 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden">
      <Image
        className="w-[1818px] h-[1047px] left-[-378px] top-[-23px] absolute shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-black"
        src="/images/login-splash.png"
        height={1047}
        width={1818}
        alt="Aerial view of FIU's MMC campus"
      />
      <div className="w-[720px] h-[1024px] px-16 py-8 right-[0px] top-0 absolute bg-gray-50 inline-flex flex-col  items-center overflow-hidden">
        <div className="w-96 h-[557.74px] p-8 bg-white rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col justify-start items-start gap-4 overflow-hidden">
          <div className="w-80 h-7 justify-start text-sky-900 text-4xl font-bold font-['Bitter']">
            Welcome Back
            <br />
          </div>
          <div className="w-80 h-14 justify-start text-zinc-600 text-base font-semibold font-['Bitter']">
            Sign in to your Kolab account
          </div>
          <div className="w-28 h-7 justify-start text-neutral-800 text-sm font-semibold font-['Bitter']">
            Email Address
          </div>
          <div className="w-80 h-12 bg-white rounded-lg border border-gray-200" />
          <div className="justify-start text-zinc-600 text-sm font-semibold font-['Bitter']">
            panther@fiu.edu
          </div>
          <div className="w-28 h-7 justify-start text-neutral-800 text-sm font-semibold font-['Bitter']">
            Password
          </div>
          <div className="w-80 h-12 bg-white rounded-lg border border-gray-200" />
          <div className="justify-start text-zinc-600 text-sm font-semibold font-['Bitter']">
            Enter your password
          </div>
          <div className="w-28 h-4 justify-start text-sky-600 text-sm font-semibold font-['Bitter']">
            Forgot Password?
          </div>
          <div className="w-32 h-3.5 justify-start text-neutral-800 text-sm font-semibold font-['Bitter']">
            Remember me
          </div>
          <div className="w-4 h-3.5 bg-sky-600 rounded" />
          <div className="w-56 h-4 inline-flex justify-start items-start gap-1">
            <div className="justify-start text-neutral-800 text-sm font-semibold font-['Bitter']">
              Don’t have an account?
            </div>
            <div className="w-16 h-2.5 justify-start text-sky-600 text-sm font-semibold font-['Bitter']">
              Sign up
            </div>
          </div>
          <div className="w-80 h-12 bg-yellow-500 rounded-lg" />
          <div className="w-14 h-5 justify-start text-sky-900 text-base font-semibold font-['Bitter']">
            Sign In
          </div>
          <div className="w-80 h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200"></div>
          <div className="w-80 h-10 text-center justify-start text-zinc-600 text-xs font-semibold font-['Bitter']">
            FIU Students Only • By signing in, you agree to our Terms of Service
            and Privacy Policy
          </div>
        </div>
        <div className="left-[941px] top-[810px]  text-center justify-start text-zinc-600 text-sm font-bold font-['Bitter']">
          Powered by FIU Students, for FIU students
        </div>
      </div>

      {/* <div className="w-[513px] h-12 left-[27px] top-[20px] absolute justify-start text-white text-4xl font-bold font-['Bitter']">
        PantherKolab
      </div> */}
      <div className="w-80 h-28 margin-auto text-center justify-start text-white text-5xl font-bold font-['Bitter']">
        Your FIU, Connected.
      </div>
      <Image
        className="w-[503px] h-[639px] left-[465px] top-[39px] absolute opacity-5"
        width={503}
        height={639}
        src="/images/login-panther-paws.png"
        alt="Decorative panther paw steps"
      />
    </div>
  );
}
