/**
 * Pure, framework-agnostic utility for tracking canvas save state.
 * Uses string equality (===) on serialized data to detect changes.
 */
export class SaveTracker {
  private lastSavedData: string | null = null;
  private dirty: boolean = false;

  /**
   * Check if data has changed since last save. Updates dirty flag.
   * Returns true if data differs from last saved snapshot, false otherwise.
   */
  markChange(currentData: string): boolean {
    if (currentData === this.lastSavedData) {
      return false;
    }
    this.dirty = true;
    return true;
  }

  /** Returns true if there are unsaved changes. */
  isDirty(): boolean {
    return this.dirty;
  }

  /** Call after a successful save to update the snapshot and clear dirty flag. */
  confirmSave(savedData: string): void {
    this.lastSavedData = savedData;
    this.dirty = false;
  }

  /** Reset to initial state (e.g., on canvas load). */
  reset(initialData?: string): void {
    this.lastSavedData = initialData ?? null;
    this.dirty = false;
  }
}
