import Image from "next/image";
import * as styles from "./login.style";


export default function Login() {
    return (
        <div
            className="w-[100%] h-[100vh] relative bg-sky-600 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden"
            style={styles.root}
        >
            <div className="w-1/2 h-[1024px] px-16 py-24 right-[0px] top-0 absolute bg-gray-50 inline-flex flex-col items-center overflow-hidden gap-y-8">
                <div className="w-96 h-[557.74px] p-8 bg-white rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col justify-start items-start gap-4 overflow-hidden login-form-container">
                    <div className="w-80 h-7 mb-4 justify-start text-sky-900 text-4xl font-bold font-['Bitter'] ">
                        Welcome Back
                        <br />
                    </div>
                    <div className="w-80 h-14 justify-start text-zinc-600 text-base font-semibold font-['Bitter']">
                        Sign in to your Kolab account
                    </div>
                    <label
                        htmlFor="email"
                        className="justify-start text-neutral-800 text-sm font-semibold font-['Bitter']"
                    >
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="panther@fiu.edu"
                        className="w-80 h-12 px-4 bg-white rounded-lg border border-gray-200 text-zinc-600 text-sm font-semibold font-['Bitter'] focus:outline-none focus:border-sky-600" />
                    <label
                        htmlFor="password"
                        className="justify-start text-neutral-800 text-sm font-semibold font-['Bitter']"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        className="w-80 h-12 px-4 bg-white rounded-lg border border-gray-200 text-zinc-600 text-sm font-semibold font-['Bitter'] focus:outline-none focus:border-sky-600" />
                    <a
                        href="/auth/forgot-password"
                        className="justify-start text-sky-600 text-sm font-semibold font-['Bitter'] hover:underline cursor-pointer"
                    >
                        Forgot Password?
                    </a>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            className="w-4 h-4 accent-sky-600 rounded cursor-pointer" />
                        <label
                            htmlFor="remember"
                            className="text-neutral-800 text-sm font-semibold font-['Bitter'] cursor-pointer"
                        >
                            Remember me
                        </label>
                    </div>
                    <div className="inline-flex justify-start items-start gap-1">
                        <span className="justify-start text-neutral-800 text-sm font-semibold font-['Bitter']">
                            Don&apos;t have an account?
                        </span>
                        <a
                            href="/signup"
                            className="justify-start text-sky-600 text-sm font-semibold font-['Bitter'] hover:underline cursor-pointer"
                        >
                            Sign up
                        </a>
                    </div>

                    <button
                        type="button"
                        className="w-80 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-sky-900 text-base font-semibold font-['Bitter'] hover:bg-yellow-600 transition-colors cursor-pointer"
                    >
                        Sign In
                    </button>
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
            <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[calc(50%)})] flex items-center justify-center`}
            >
                <div className="text-center text-white text-5xl font-bold font-['Bitter']">
                    Your FIU, <br />
                    Connected.
                </div>
            </div>
            {/* <Image
                className="w-[503px] h-[639px] left-[465px] top-[39px] absolute opacity-5"
                width={503}
                height={639}
                src="/images/login-panther-paws.png"
                alt="Decorative panther paw steps" /> */}
        </div>
    );
}
