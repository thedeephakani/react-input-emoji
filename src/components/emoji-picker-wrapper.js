// @ts-check
// vendors
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  getImageEmoji,
  replaceAllTextEmojis,
  replaceAllTextEmojiToString
} from "../utils/emoji-utils";

import EmojiPickerButton from "./emoji-picker-button";
import EmojiPickerContainer from "./emoji-picker-container";
import { cacheCurrentRange } from "../utils/input-event-utils";

const EMOJI_PICKER_CONTAINER_HEIGHT = 435;

/**
 * @typedef {import('../types/types').SanitizeFn} SanitizeFn
 */

/**
 * @typedef {import('../types/types').PolluteFn} PolluteFn
 */

/**
 * @typedef {Object} Props
 * @property {'light' | 'dark' | 'auto'} theme
 * @property {boolean} keepOpened
 * @property {boolean} disableRecent
 * @property {any[]=} customEmojis
 * @property {(fn: SanitizeFn) => void} addSanitizeFn
 * @property {(fn: PolluteFn) => void} addPolluteFn
 * @property {(html: string, emoji: any) => void} appendContent
 * @property {HTMLDivElement=} buttonElement
 * @property {React.MutableRefObject=} buttonRef
 * @property {import('../types/types').Languages=} language
 */

// eslint-disable-next-line valid-jsdoc
/** @type {React.FC<Props>} */
const EmojiPickerWrapper = props => {
  const {
    theme,
    keepOpened,
    disableRecent,
    customEmojis,
    addSanitizeFn,
    addPolluteFn,
    appendContent,
    buttonElement,
    buttonRef,
    language
  } = props;

  const [showPicker, setShowPicker] = useState(false);
  /** @type {[HTMLDivElement | undefined, React.Dispatch<React.SetStateAction<HTMLDivElement | undefined>>]} */
  const [customButton, setCustomButton] = useState();
  /** @type {['above' | 'below' | undefined, React.Dispatch<React.SetStateAction<'above' | 'below' | undefined>>]} */
  const [emojiPickerPosition, setEmojiPickerPosition] = useState()

  useEffect(() => {
    if (showPicker) {
      cacheCurrentRange()
    }
  }, [showPicker])

  useEffect(() => {
    addSanitizeFn(replaceAllTextEmojiToString);
  }, [addSanitizeFn]);

  useEffect(() => {
    addPolluteFn(replaceAllTextEmojis);
  }, [addPolluteFn]);

  useEffect(() => {
    /**
     *
     * @param {MouseEvent} event
     */
    function checkClickOutside(event) {
      /** @type {HTMLElement} */
      // @ts-ignore
      const element = event.target;

      if (
        element.classList.contains("react-input-emoji--button") ||
        element.classList.contains("react-input-emoji--button--icon")
      ) {
        return;
      }

      setShowPicker(false);
    }

    document.addEventListener("click", checkClickOutside);

    return () => {
      document.removeEventListener("click", checkClickOutside);
    };
  }, []);

  /**
   *
   * @param {React.MouseEvent} event
   */
  function toggleShowPicker(event) {
    event.stopPropagation();
    event.preventDefault();

    setEmojiPickerPosition(calcTopPosition(event))

    setShowPicker(currentShowPicker => !currentShowPicker);
  }

  /**
   * 
   * @param {React.MouseEvent} event
   * @return {'above' | 'below'}
   */
  function calcTopPosition(event) {
    const btn = event.currentTarget
    const btnRect = btn.getBoundingClientRect();

    const popoverHeight = EMOJI_PICKER_CONTAINER_HEIGHT;

    // Decide to display above or below based on available space
    if (btnRect.top >= popoverHeight) {
      // Display above
      return 'above'
    } else {
      // Display below
      return 'below'
    }
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   *
   * @param {import("../types/types").EmojiMartItem} emoji
   */
  function handleSelectEmoji(emoji) {
    appendContent(getImageEmoji(emoji), emoji);

    if (!keepOpened) {
      setShowPicker(currentShowPicker => !currentShowPicker);
    }
  }

  useEffect(() => {
    if (buttonRef?.current?.style) {
      buttonRef.current.style.position = "relative";
      setCustomButton(buttonRef.current);
    } else if (buttonElement?.style) {
      buttonElement.style.position = "relative";
      setCustomButton(buttonElement);
    }
  }, [buttonRef, buttonElement]);

  return customButton ? (
    (ReactDOM.createPortal(
      <>
        <EmojiPickerContainer
          showPicker={showPicker}
          theme={theme}
          handleSelectEmoji={handleSelectEmoji}
          disableRecent={disableRecent}
          customEmojis={customEmojis}
          position={emojiPickerPosition}
          language={language}
        />
        <EmojiPickerButton
          showPicker={showPicker}
          toggleShowPicker={toggleShowPicker}
          buttonElement={customButton}
          buttonRef={buttonRef}
        />
      </>,
      customButton
    ))
  ) : (
    (<>
      <EmojiPickerContainer
        showPicker={showPicker}
        theme={theme}
        handleSelectEmoji={handleSelectEmoji}
        disableRecent={disableRecent}
        customEmojis={customEmojis}
        position={emojiPickerPosition}
        language={language}
      />
      <EmojiPickerButton
        showPicker={showPicker}
        toggleShowPicker={toggleShowPicker}
      />
    </>)
  );
};

export default EmojiPickerWrapper;
