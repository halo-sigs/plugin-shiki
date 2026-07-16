# Code Highlighting

This context defines the user-visible concepts used when source code is highlighted and presented.

## Language

**Code fold**:
A presentation-only state that independently hides a contiguous range of highlighted lines by default, without changing the source or other folds. Copying or reading the code always includes the hidden lines.
_Avoid_: Code collapse

**Fold notation**:
A flat, non-overlapping pair of fold markers, or one final start marker that folds through the end of the code block. Nested or ambiguous markers fail open and leave their code visible.
_Avoid_: Nested fold, recursive fold
