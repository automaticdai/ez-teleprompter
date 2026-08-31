// The keys a Bluetooth presentation clicker sends, and what the teleprompter
// does with them.
//
// Shared by the in-app keymap (renderer) and the global remote-mode
// accelerators (main) so the two can never drift: the same physical button on
// the clicker must do the same thing whether or not the prompter happens to be
// the focused window. These strings are valid both as `KeyboardEvent.code`
// values and as Electron accelerator names, which coincide for these keys.
//
// Speed lives on the arrow keys locally and on F6/F7 globally — the clicker
// only owns the transport controls.
export const CLICKER_KEYMAP = {
  PageDown: 'playPause',
  PageUp: 'reset'
}
