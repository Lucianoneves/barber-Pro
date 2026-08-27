import { canSSRGuest } from "@/src/services/utils/canSSRGuest";

export default function Home() {
  return null;
}

export const getServerSideProps = canSSRGuest(async () => {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
});
