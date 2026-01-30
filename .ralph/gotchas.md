# Gotchas

Mistakes made that shouldn't be repeated.

Format:
```
## YYYY-MM-DD
- DON'T: [What went wrong]
- DO: [What to do instead]
```

---

## 2026-01-18
- DON'T: Specify non-existent crate versions (e.g., security-framework-sys = "3" when only 2.x exists)
- DO: Check crates.io for available versions before specifying dependencies

## 2026-01-18
- DON'T: Use raw pointers (*const AtomicBool) in async blocks spawned with tokio::spawn
- DO: Use Arc<AtomicBool> and clone the Arc for the async block (raw pointers are not Send)

## 2026-01-18
- DON'T: Wrap struct fields in RwLock without updating all callers
- DO: When adding RwLock to a field, search for all usages and add .read().unwrap() or .write().unwrap()

## 2026-01-18
- DON'T: Import from private modules (e.g., draupnir_chains::types::Nft)
- DO: Use public re-exports (e.g., draupnir_chains::Nft)

## 2026-01-18
- DON'T: Change function signatures (e.g., adding required parameters) without updating all callers
- DO: Update all call sites when changing function signatures, or provide backward-compatible defaults

## 2026-01-18
- DON'T: Hold RwLock guards across await points in async code
- DO: Clone/collect data out of the RwLock immediately and release the guard before any async operations

## 2026-01-18
- DON'T: Define closures that need to be 'static inside the Tauri setup closure where `app` is in scope
- DO: Consider restructuring to extract state early and create closures with explicit ownership

## 2026-01-18
- DON'T: Register non-Clone types directly with Tauri's .manage() if they need to be extracted and used in closures
- DO: Wrap types in Arc before registering (e.g., `Arc::new(ProviderRegistry::new())`) so they can be properly cloned in setup closures

## 2026-01-18
- DON'T: Call .is_empty() on iterators (iterators don't have this method)
- DO: Use .next().is_some() or .count() > 0 to check if an iterator has elements

## 2026-01-20
- DON'T: Leave storage implementations incomplete
- DO: Ensure all secure storage (SeedStorage and BiometricSeedStorage) persists to OS keychain
- NOTE: Both SeedStorage (wallet.rs) and BiometricSeedStorage (security.rs) now use MacOSStorage for persistent storage. Fixed 2026-01-20.

## 2026-01-20
- DON'T: Assume "completed" polish tasks mean core functionality works
- DO: Always verify core security/storage features work end-to-end before moving to polish tasks
