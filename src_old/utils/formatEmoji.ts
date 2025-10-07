import { EMOJI_REGEXP } from "../utils/constants";

type ElementWithSetHTMLMethod = Element & { setHTML?: Function };

export default function formatEmoji(el: HTMLElement) {
  // const emojiMessages = el.querySelectorAll(".format-emoji");
  // console.log(emojiMessages);
  // // emojiMessages.forEach((m: ElementWithSetHTMLMethod) => {
  // //   m.setHTML?.(
  // //     m.innerHTML.replace(
  // //       EMOJI_REGEXP,
  // //       (match) => `<span class="emoji-text">${match}</span>`
  // //     )
  // //   );
  // // });
  // emojiMessages.forEach((m) => m.classList.remove("format-emoji"));
}
