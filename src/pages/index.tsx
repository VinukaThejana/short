import { z } from "zod";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { trpc } from "src/utils/trpc";
import { Loader } from "src/components/utils/loader";
import { classNames } from "src/utils/utils";
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  BadgeCheckIcon,
  GlobeIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import toast from "react-hot-toast";
import { Layout } from "src/components/layouts/layout";
import debounce from "lodash.debounce";

export default function Home() {
  const formSchema = z.object({
    url: z.string().url(),
    slug: z
      .string()
      .min(3, "The slug must be greater than 3 characters")
      .max(15, "What is the purpose of the link shortner bro"),
  });

  type Form = {
    url: string;
    slug: string;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    control,
  } = useForm<Form>({
    resolver: zodResolver(formSchema),
  });
  const slug = watch("slug");

  const { dirtyFields } = useFormState({
    control,
  });

  const [deleting, setDeleting] = useState<boolean>(false);
  const [slugValidating, setSlugValidating] = useState<boolean>(false);
  const [slugValid, setSlugValid] = useState<boolean>(false);

  const { data: session, status } = useSession();
  const createLink = trpc.useMutation(["protectedLinks.createLink"]);
  const deleteLink = trpc.useMutation(["protectedLinks.deleteLink"]);
  const checkSlug = trpc.useMutation(["protectedLinks.checkSlug"]);
  const {
    data,
    isLoading: loading,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.useInfiniteQuery(["unprotectedLinks.getLinks", { limit: 3 }], {
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
  });

  // eslint-disable-next-line
  const checkForSlug = useCallback(
    debounce(async (slug: string) => {
      setSlugValidating(true);

      if (slug && slug.length >= 3) {
        const state = await checkSlug.mutateAsync({ slug: slug });

        if (state) {
          setSlugValidating(false);
          setSlugValid(false);
          setError("slug", {
            type: "manual",
            message: "This slug is already taken",
          });
        } else {
          setSlugValidating(false);
          setSlugValid(true);
          clearErrors();
        }
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkForSlug(slug);
  }, [slug, checkForSlug]);

  const onSubmit = async (data: Form) => {
    if (!session) {
      return;
    }

    toast.loading("Creating shortned URL");
    await createLink.mutateAsync({
      url: data.url,
      slug: data.slug,
    });
    toast.dismiss();

    toast.success("Created the shortned URL");
    toast.success("Copied the URL to the clipboard");
    navigator.clipboard.writeText(`https://small-link.vercel.app/${data.slug}`);
    await refetch();
    reset();
  };

  return status === "loading" ? (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Loader />
    </main>
  ) : (
    <>
      {status === "unauthenticated" ? (
        <main className="flex flex-col items-center justify-center min-h-screen">
          <button
            type="button"
            className={classNames(
              "text-white bg-[#4285F4] hover:bg-[#4285F4]/90",
              "focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center",
              "inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2 h-14"
            )}
            onClick={() => signIn("google")}
          >
            <svg
              className="mr-2 -ml-1 w-4 h-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Continue with Google
          </button>
        </main>
      ) : (
        <div className="flex flex-col items-center justify-top min-h-screen">
          <main className="flex flex-col items-center justify-center pb-10">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col items-center justify-center gap-4 pt-16"
            >
              <div className="flex flex-col items-start justfiy-center">
                <label className="font-bold ml-2">Long link</label>

                <div className="mt-1 flex rounded-md shadow-sm w-72 sm:w-96">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    <GlobeIcon className="w-6 h-6 text-green-600" />
                  </span>
                  <input
                    {...register("url")}
                    type="text"
                    className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                    placeholder="https://long-link.example.com"
                  />
                </div>
                {errors.url?.message && (
                  <p className="text-red-600 text-sm font-bold">
                    {errors.url.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-start justfiy-center">
                <label className="font-bold ml-2">Shortned slug</label>

                <div className="mt-1 flex rounded-md shadow-sm w-72 sm:w-96">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    small-link/
                  </span>
                  <input
                    {...register("slug")}
                    type="text"
                    className={classNames(
                      "focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none sm:text-sm border-gray-300",
                      dirtyFields.slug ? "" : "rounded-r-md"
                    )}
                    placeholder="slug"
                  />
                  {dirtyFields.slug ? (
                    <span
                      className={classNames(
                        "inline-flex items-center px-3 rounded-r-md border border-r-0 text-gray-500 text-sm"
                      )}
                    >
                      {slugValidating ? (
                        <Loader width={6} height={6} />
                      ) : (
                        <>
                          {slugValid ? (
                            <BadgeCheckIcon className="w-8 h-8 text-green-600" />
                          ) : (
                            <XCircleIcon className="w-8 h-8 text-red-600" />
                          )}
                        </>
                      )}
                    </span>
                  ) : null}
                </div>
                {errors.slug?.message && (
                  <p className="text-red-600 text-sm font-bold">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  (dirtyFields.slug && !slugValid) || createLink.isLoading
                }
                className={classNames(
                  "inline-flex justify-center w-56 py-2 px-4 border border-transparent shadow-sm text-sm",
                  "font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                )}
              >
                {createLink.isLoading ? "Saving..." : "Save"}
              </button>
            </form>

            <div className="flex flex-col items-center justify-center mt-16">
              {loading ? (
                <Loader />
              ) : (
                <div className="flex flex-col items-center justify-center gap-4">
                  <>
                    {data?.pages.map((linkData, index) => (
                      <Fragment key={index}>
                        {linkData?.links.map((link) => (
                          <article
                            key={link.id}
                            className="mt-1 flex rounded-md shadow-sm w-72 sm:w-96"
                          >
                            <span
                              className={classNames(
                                "inline-flex items-center px-3 rounded-l-md border border-r-0 cursor-pointer",
                                "border-gray-300 bg-gray-50 text-gray-500 text-sm w-40 sm:w-56"
                              )}
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `https://small-link.vercel.app/${link.slug}`
                                );
                                toast.success(`Copied ${link.slug}`);
                              }}
                            >
                              {link.url}
                            </span>
                            <input
                              type="text"
                              disabled={true}
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                              placeholder={link.slug}
                            />
                            <TrashIcon
                              type="button"
                              className="w-8 h-8 rounded-md text-red-600 cursor-pointer mt-1 ml-2"
                              onClick={async () => {
                                if (deleting) {
                                  return;
                                }

                                toast.loading(`Deleting ${link.slug}`);
                                setDeleting(true);

                                await deleteLink.mutateAsync({ id: link.id });
                                await refetch();

                                toast.dismiss();
                                toast.success(`Deleted ${link.slug}`);

                                setDeleting(false);
                              }}
                            />
                          </article>
                        ))}
                      </Fragment>
                    ))}
                  </>

                  {hasNextPage ? (
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={createLink.isLoading}
                      className={classNames(
                        "inline-flex justify-center w-56 py-2 px-4 border border-transparent shadow-sm text-sm",
                        "font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                      )}
                    >
                      {isFetchingNextPage ? "Loading..." : "Load"}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
