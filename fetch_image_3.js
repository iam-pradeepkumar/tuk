import fetch from 'node-fetch';

async function main() {
  try {
    const res = await fetch("https://ibb.co/35kpPDFv");
    const text = await res.text();
    const match = text.match(/<meta property="og:image" content="([^"]+)"/);
    if (match) {
      console.log("FOUND_URL:", match[1]);
    } else {
      console.log("NOT_FOUND_OG_IMAGE");
    }
  } catch (err) {
    console.error(err);
  }
}
main();
