// React 19 (@types/react 19) usunęło globalny namespace `JSX` na rzecz `React.JSX`.
// Kod w tym repo używa `JSX.Element` jako typu zwracanego w wielu komponentach –
// ten shim przywraca globalny `JSX` mapując go na `React.JSX`, bez masowej edycji plików.
import type * as React from 'react';

declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
    type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
  }
}

export {};
