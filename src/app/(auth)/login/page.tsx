import { LoginForm } from '@/components/auth/LoginForm';
import Image from "next/image";
import * as styles from "./login.style";

export default function Login() {
  return (
    <div
      className="w-[100%] h-[100vh] relative bg-sky-600 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden"
      style={styles.root}
    >
      <div className="w-1/2 h-[1024px] px-16 py-24 right-[0px] top-0 absolute bg-gray-50 inline-flex flex-col items-center overflow-hidden gap-y-8">
        <LoginForm />
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
        alt="Decorative panther paw steps"
      /> */}
    </div>
  );
}
