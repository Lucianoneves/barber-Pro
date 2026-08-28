import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;900&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var p=location.pathname;var shop=p==="/dashboard"||p.indexOf("/haircuts")===0||p==="/customers"||p==="/hours"||p==="/profile"||p==="/new"||p.indexOf("/planos")===0;if(!shop)return;if(sessionStorage.getItem("@barber.session"))return;document.cookie="@barber.token=; path=/; max-age=0";location.replace("/login");}catch(e){}})();`,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
