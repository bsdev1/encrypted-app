export async function scrollToBottom() {
  let messagesElement = document.querySelector('#messages');

  messagesElement?.scrollTo({
    top: messagesElement.scrollHeight,
    behavior: 'smooth',
  });

  const lastMessage = [...document.querySelectorAll('.message')].at(-1);

  if (lastMessage)
    await new Promise((resolve) => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(lastMessage);
    });

  return messagesElement;
}

export async function importKey(key) {
  const importedKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'oct',
      k: key ?? localStorage.getItem('key'),
      alg: 'A256GCM',
    },
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );

  return importedKey;
}

export async function waitForCaptcha() {
  await new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
      const captchaMutation = mutations.find(
        (mutation) => mutation.target.id == 'hcap-script'
      );

      if (captchaMutation) {
        const hcaptchaFrame = document.querySelector('iframe');

        if (hcaptchaFrame)
          hcaptchaFrame.onload = () => {
            resolve();
            observer.disconnect();
          };
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
