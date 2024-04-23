import { useOnClickOutside} from "usehooks-ts";
import {RefObject} from "preact";

const useMenuDropDown = (ref: RefObject<any>, onClickOutside: () => void) => {
  console.log('works')
  useOnClickOutside(ref, onClickOutside, "mousedown")
  useOnClickOutside(ref, onClickOutside, "touchstart")

  // @ts-ignore Focus in event works the same way as mousedown.
  // @see https://github.com/juliencrn/usehooks-ts/discussions/522
  useOnClickOutside(ref, onClickOutside, "focusin")
}

export default useMenuDropDown;
