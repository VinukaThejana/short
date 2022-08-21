import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export const Navbar = () => {
  const { data: session, status } = useSession();
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div className="relative flex items-center justify-end h-16 border-b">
        <>
          {status !== "loading" ? (
            <>
              {status === "authenticated" ? (
                <div className="relative">
                  <Image
                    src={session.user?.image as string}
                    alt={session.user?.name as string}
                    width={50}
                    height={50}
                    onClick={() => signOut()}
                    className="rounded-full cursor-pointer"
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </>
      </div>
    </div>
  );
};
