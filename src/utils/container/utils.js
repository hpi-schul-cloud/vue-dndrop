/* eslint-disable no-useless-call */
import { containerInstance } from './constants';
export const getIntersection = (rect1, rect2) => {
  return {
    left: Math.max(rect1.left, rect2.left),
    top: Math.max(rect1.top, rect2.top),
    right: Math.min(rect1.right, rect2.right),
    bottom: Math.min(rect1.bottom, rect2.bottom),
  };
};

const ScrollAxis = {
  x: 'x',
  y: 'y',
  xy: 'xy'
};

export const getIntersectionOnAxis = (rect1, rect2, axis) => {
  if (axis === 'x') {
    return {
      left: Math.max(rect1.left, rect2.left),
      top: rect1.top,
      right: Math.min(rect1.right, rect2.right),
      bottom: rect1.bottom,
    };
  } else {
    return {
      left: rect1.left,
      top: Math.max(rect1.top, rect2.top),
      right: rect1.right,
      bottom: Math.min(rect1.bottom, rect2.bottom),
    };
  }
};
export const getContainerRect = (element) => {
  const _rect = element.getBoundingClientRect();
  const rect = {
    left: _rect.left,
    right: _rect.right,
    top: _rect.top,
    bottom: _rect.bottom,
  };
  if (hasBiggerChild(element, 'x') && !isScrollingOrHidden(element, 'x')) {
    const width = rect.right - rect.left;
    rect.right = rect.right + element.scrollWidth - width;
  }
  if (hasBiggerChild(element, 'y') && !isScrollingOrHidden(element, 'y')) {
    const height = rect.bottom - rect.top;
    rect.bottom = rect.bottom + element.scrollHeight - height;
  }
  return rect;
};
export const getScrollingAxis = (element) => {
  const style = window.getComputedStyle(element);
  const overflow = style.overflow;
  const general = overflow === 'auto' || overflow === 'scroll';
  if (general) return ScrollAxis.xy;
  const overFlowX = style['overflow-x'];
  const xScroll = overFlowX === 'auto' || overFlowX === 'scroll';
  const overFlowY = style['overflow-y'];
  const yScroll = overFlowY === 'auto' || overFlowY === 'scroll';
  if (xScroll && yScroll) return ScrollAxis.xy;
  if (xScroll) return ScrollAxis.x;
  if (yScroll) return ScrollAxis.y;
  return null;
};
export const isScrolling = (element, axis) => {
  const style = window.getComputedStyle(element);
  const overflow = style.overflow;
  const overFlowAxis = style[`overflow-${axis}`];
  const general = overflow === 'auto' || overflow === 'scroll';
  const dimensionScroll = overFlowAxis === 'auto' || overFlowAxis === 'scroll';
  return general || dimensionScroll;
};
export const isScrollingOrHidden = (element, axis) => {
  return false;
};
export const hasBiggerChild = (element, axis) => {
  if (axis === 'x') {
    return element.scrollWidth > element.clientWidth;
  } else {
    return element.scrollHeight > element.clientHeight;
  }
};
export const getVisibleRect = (element, elementRect) => {
  let currentElement = element;
  let rect = elementRect || getContainerRect(element);
  currentElement = element.parentElement;
  while (currentElement) {
    if (hasBiggerChild(currentElement, 'x') && isScrollingOrHidden(currentElement, 'x')) {
      rect = getIntersectionOnAxis(rect, currentElement.getBoundingClientRect(), 'x');
    }
    if (hasBiggerChild(currentElement, 'y') && isScrollingOrHidden(currentElement, 'y')) {
      rect = getIntersectionOnAxis(rect, currentElement.getBoundingClientRect(), 'y');
    }
    currentElement = currentElement.parentElement;
  }
  return rect;
};
export const getParentRelevantContainerElement = (element, relevantContainers) => {
  let current = element;
  while (current) {
    if (current[containerInstance]) {
      const container = current[containerInstance];
      if (relevantContainers.some(p => p === container)) {
        return container;
      }
    }
    current = current.parentElement;
  }
  return null;
};
export const listenScrollParent = (element, clb) => {
  let scrollers = [];
  setScrollers();
  function setScrollers () {
    let currentElement = element;
    while (currentElement) {
      if (isScrolling(currentElement, 'x') || isScrolling(currentElement, 'y')) {
        scrollers.push(currentElement);
      }
      currentElement = currentElement.parentElement;
    }
  }
  function dispose () {
    stop();
    scrollers = null;
  }
  ;
  function start () {
    if (scrollers) {
      scrollers.forEach(p => p.addEventListener('scroll', clb));
      window.addEventListener('scroll', clb);
    }
  }
  function stop () {
    if (scrollers) {
      scrollers.forEach(p => p.removeEventListener('scroll', clb));
      window.removeEventListener('scroll', clb);
    }
  }
  return {
    dispose,
    start,
    stop
  };
};
export const hasParent = (element, parent) => {
  let current = element;
  while (current) {
    if (current === parent) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};
export const getParent = (element, selector) => {
  let current = element;
  while (current) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};
export const hasClass = (element, cls) => {
  return (element.className
    .split(' ')
    .map(p => p)
    .indexOf(cls) > -1);
};
export const addClass = (element, cls) => {
  if (element) {
    const classes = element.className.split(' ').filter(p => p);
    if (classes.indexOf(cls) === -1) {
      classes.unshift(cls);
      element.className = classes.join(' ');
    }
  }
};
export const removeClass = (element, cls) => {
  if (element) {
    const classes = element.className.split(' ').filter(p => p && p !== cls);
    element.className = classes.join(' ');
  }
};
export const debounce = (fn, delay, immediate) => {
  let timer = null;
  return (...params) => {
    if (timer) {
      clearTimeout(timer);
    }
    if (immediate && !timer) {
      fn.call(null, ...params);
    } else {
      timer = setTimeout(() => {
        timer = null;
        fn.call(null, ...params);
      }, delay);
    }
  };
};
export const removeChildAt = (parent, index) => {
  return parent.removeChild(parent.children[index]);
};
export const addChildAt = (parent, child, index) => {
  if (index >= parent.children.length) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, parent.children[index]);
  }
};
export const isMobile = () => {
  if (typeof window !== 'undefined') {
    if (window.navigator.userAgent.match(/Android/i) ||
            window.navigator.userAgent.match(/webOS/i) ||
            window.navigator.userAgent.match(/iPhone/i) ||
            window.navigator.userAgent.match(/iPad/i) ||
            window.navigator.userAgent.match(/iPod/i) ||
            window.navigator.userAgent.match(/BlackBerry/i) ||
            window.navigator.userAgent.match(/Windows Phone/i)) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};
export const clearSelection = () => {
  if (window.getSelection) {
// @ts-ignore: Object is possibly 'null'.
    if (window.getSelection().empty) {
      // Chrome
// @ts-ignore: Object is possibly 'null'.
      window.getSelection().empty();
// @ts-ignore: Object is possibly 'null'.
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
// @ts-ignore: Object is possibly 'null'.
      window.getSelection().removeAllRanges();
    }
  } else if (window.document.selection) {
    // IE?
    window.document.selection.empty();
  }
};
export const getElementCursor = (element) => {
  if (element) {
    const style = window.getComputedStyle(element);
    if (style) {
      return style.cursor;
    }
  }
  return null;
};
export const getDistanceToParent = (parent, child) => {
  let current = child;
  let dist = 0;
  while (current) {
    if (current === parent) {
      return dist;
    }
    dist++;
    current = current.parentElement;
  }
  return null;
};
export function isVisible(rect) {
  if (rect === undefined) {
    return false;
  }
  return !(rect.bottom <= rect.top || rect.right <= rect.left);
}