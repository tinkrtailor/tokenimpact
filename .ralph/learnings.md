# Learnings

Discoveries about the codebase that future iterations should know.

## Build System

- **Workspace Structure**: 7 crates total - `draupnir-app` (binary), `draupnir-core`, `draupnir-chains`, `draupnir-evm`, `draupnir-solana`, `draupnir-crypto`, `draupnir-storage`
- **Dependency Graph**: `crypto` has no internal deps, `chains` defines traits only, `evm`/`solana` implement `chains`, `core` uses `crypto`, `app` depends on all
- **Frontend**: Tauri 2.0 + Svelte 5 in `frontend/` directory

## Codebase Patterns

- **Error Handling**: Each crate defines its own `Error` enum with `thiserror`; app wraps all as `AppError`
- **State Management**: `AppState` uses `RwLock<T>` for `WalletManager` and `Config`, immutable `ChainRegistry`
- **Async**: All chain operations use `#[async_trait]`, Tauri runtime for async commands
- **Security Types**: All key material wrapped in `SecretBox<T>` from `secrecy` crate v0.10, auto-zeroized on drop
- **No .unwrap() in Library Code**: Use proper error propagation (`?`, `ok_or()`, `map_err()`); `.unwrap()` only in tests and doc examples
- **Lock Poisoning**: Use `lock().map_err()` or `lock().unwrap_or_else(|e| e.into_inner())` to handle poisoned mutexes gracefully
- **SystemTime**: Use `.duration_since(UNIX_EPOCH).unwrap_or_default()` instead of `.unwrap()` for timestamp calculations

## Dependencies

- **Crypto**: `ring` or `getrandom` for entropy, `bip39`, `secp256k1`, `ed25519-dalek`, `argon2`, `aes-gcm`
- **EVM**: `alloy` for RPC and types
- **Solana**: `solana-sdk`, `solana-client`
- **Storage**: `security-framework` (macOS), `keyring` (cross-platform fallback)
- **External APIs**: Alchemy (EVM+Solana RPC), Helius DAS (Solana NFTs), CoinGecko (prices)

## Implementation Status (2026-01-15)

- **Completed Tasks**: setup-001 through setup-005, crypto-001 through crypto-011 (except crypto-008), storage-001, chains-001, chains-002, core-001 through core-003, ui-013, app-001, app-002 - 71 tasks remaining
- **Next Tasks**: crypto-008 (Solana tx signing), storage-002 (macOS Keychain), storage-003 (JSON file storage), evm-001 (EVM ChainProvider), solana-001 (Solana ChainProvider), ui-001 through ui-004 (onboarding screens)
- **Critical Path**: app-002 ✓ → ui-001 through ui-004 (onboarding UI); evm-001/solana-001 → app-003 (chain commands); storage-002/003 needed for full persistence
- **Crate Structure**: All 7 crates created with proper dependencies, builds pass

## Crypto Module

- **BIP-39 Implementation**: Uses `bip39` crate v2 with `getrandom` for entropy
- **WordCount Enum**: `WordCount::Twelve` (12 words, 128-bit entropy), `WordCount::TwentyFour` (24 words, 256-bit entropy)
- **Error Types**: `MnemonicError::InvalidWord`, `InvalidWordCount`, `InvalidChecksum` - each provides specific error messages
- **Wordlist Note**: BIP-39 English wordlist contains common words like "hello", "world", "abandon" - tests should use clearly invalid words like "xyz123"
- **EVM Key Derivation**: Uses `bip32` for HD derivation, `k256` for secp256k1, `sha3` for Keccak-256
- **Derivation Path**: EVM uses `m/44'/60'/0'/0/{index}` (BIP-44 standard for Ethereum)
- **Address Generation**: Uncompressed pubkey (skip 0x04 prefix) → Keccak-256 → last 20 bytes → EIP-55 checksum
- **Secrecy Crate v0.10**: Uses `SecretBox<T>` (not `Secret<T>`), created via `SecretBox::new(Box::new(value))`
- **Solana Key Derivation**: Uses SLIP-10 (not BIP-32) for Ed25519 HD derivation with fully hardened path `m/44'/501'/account'/0'`
- **SLIP-10 Algorithm**: Master key from HMAC-SHA512(key="ed25519 seed", data=seed); child keys via HMAC-SHA512(key=parent_chain_code, data=0x00||parent_key||index_be)
- **Solana Address Format**: Base58-encoded 32-byte Ed25519 public key (no hashing, unlike EVM)
- **Argon2id KDF**: Uses `argon2` crate v0.5 with `Argon2::new(Algorithm::Argon2id, Version::V0x13, params)`
- **KDF Parameters**: memory_cost=65536 (64MB), time_cost=3, parallelism=4, output_length=32; matches security.md spec
- **KDF Salt**: 32 bytes generated via `getrandom`, stored alongside encrypted data
- **KDF Output**: `SecretBox<[u8; 32]>` for automatic zeroization; use `Zeroizing<T>` for intermediate buffers
- **AES-256-GCM Encryption**: Uses `aes-gcm` crate v0.10 with `Aes256Gcm::new_from_slice()` for key initialization
- **GCM Nonce**: 12 bytes (96 bits), generated fresh for each encryption via `getrandom`; use `Nonce::from(array)` not deprecated `from_slice()`
- **EncryptedData Struct**: Contains version (u8), nonce ([u8; 12]), ciphertext (Vec<u8> including 16-byte auth tag)
- **Decryption Output**: Returns `Zeroizing<Vec<u8>>` for automatic zeroization of decrypted sensitive data
- **Serialization**: EncryptedData derives Serialize/Deserialize for JSON storage; dev-dependency on serde_json for tests
- **Password Validation**: `validate_password()` returns `PasswordError` variants (TooShort, MissingUppercase, MissingLowercase, MissingNumber)
- **Password Strength**: Weak (fails requirements), Medium (meets requirements), Strong (16+ chars with symbol)
- **Password Check Struct**: `check_password()` returns `PasswordValidation` with booleans for each requirement (has_min_length, has_uppercase, etc.) for UI feedback
- **Spec Discrepancy**: onboarding.md acceptance test lists "ValidPass123!@#" as Strong but spec says "16+ chars with symbols"; this password is only 15 chars, so implementation uses 16+ threshold

## Address Validation

- **Location**: `draupnir-crypto/src/address.rs` - EVM (EIP-55) and Solana (base58) address validation
- **validate_evm_address()**: Accepts lowercase, uppercase, or properly checksummed mixed-case; rejects mixed-case with wrong checksum
- **EvmAddressInfo**: Returns `{ bytes: [u8; 20], checksummed: String, was_checksummed: bool }`
- **EIP-55 Checksum**: Keccak-256 hash of lowercase hex, uppercase if nibble >= 8
- **validate_solana_address()**: Verifies base58 alphabet and decodes to exactly 32 bytes
- **SolanaAddressInfo**: Returns `{ bytes: [u8; 32], address: String }`
- **Base58 Exclusions**: Characters `0`, `O`, `I`, `l` are invalid (ambiguous)
- **AddressError Variants**: InvalidLength, InvalidCharacters, InvalidChecksum, InvalidBase58, InvalidDecodedLength
- **Convenience Functions**: `is_valid_evm_address()` and `is_valid_solana_address()` return bool

## EVM Transaction Signing

- **Location**: `draupnir-crypto/src/signing/evm.rs` - EIP-1559 transaction signing
- **Transaction Format**: EIP-1559 (Type 2) uses `0x02 || rlp([chain_id, nonce, max_priority_fee, max_fee, gas_limit, to, value, data, access_list, v, r, s])`
- **Signing Hash**: `keccak256(0x02 || rlp(tx_fields_without_signature))` per EIP-2718
- **Eip1559Transaction**: Struct with builder pattern - `new(chain_id, nonce, to)` then `.with_value()`, `.with_data()`, etc.
- **sign_evm_transaction()**: Takes `&Eip1559Transaction` and `&SecretBox<[u8; 32]>`, returns `SignedEvmTransaction`
- **k256 v0.13 API**: Uses `SigningKey::sign_prehash_recoverable(&hash)` which returns `(Signature, RecoveryId)`
- **Signature Components**: v is recovery ID (0 or 1 for EIP-1559, not chain-specific like legacy), r and s are 32 bytes each
- **SignedEvmTransaction Methods**: `raw_transaction()` returns broadcast-ready bytes, `recover_signer()` verifies signature, `transaction_hash()` returns keccak256 of raw tx
- **Recovery**: Uses `VerifyingKey::recover_from_prehash(&hash, &signature, recovery_id)` to recover public key
- **Address Derivation**: Public key (uncompressed, skip 0x04) -> keccak256 -> last 20 bytes
- **RLP Encoding**: Uses `rlp` crate v0.6, `RlpStream::new_list(n)` for lists, `stream.append()` for values
- **Access List**: Vec of `AccessListItem { address: [u8; 20], storage_keys: Vec<[u8; 32]> }`
- **Contract Creation**: `to` field is `None`, encoded as empty RLP data
- **Testing Pattern**: Use `derive_evm_key()` to get actual private key from test mnemonic, don't hardcode key bytes

## Solana Transaction Signing

- **Location**: `draupnir-crypto/src/signing/solana.rs` - Ed25519 transaction signing
- **UnsignedSolanaTransaction**: Wrapper for message bytes, supports both legacy and versioned formats
- **Version Detection**: High bit set (0x80) in first byte indicates versioned transaction (v0)
- **sign_solana_transaction()**: Takes `&UnsignedSolanaTransaction` and `&SecretBox<[u8; 32]>`, returns `SignedSolanaTransaction`
- **Ed25519 Signing**: Uses `ed25519-dalek` with `SigningKey::from_bytes()` and `sign()` method
- **Signature Format**: 64 bytes, deterministic (same message + key = same signature)
- **SignedSolanaTransaction Methods**: `signature_base58()` for standard format, `raw_transaction()` for broadcast, `verify()` for verification, `transaction_hash()` same as signature
- **Raw Transaction Format**: `[signature_count(1 byte)][signature(64 bytes)][message_bytes]`
- **Transaction Hash**: In Solana, tx hash is the first signature (base58 encoded)
- **Verification**: `verify_solana_signature(message, signature, public_key)` standalone function
- **Testing Pattern**: Use `derive_solana_key()` to get actual private key from test mnemonic

## Storage Module

- **SecureStorage Trait**: Async trait with `#[async_trait]` for platform-specific implementations
- **Core Methods**: `store(key, data)`, `retrieve(key)`, `list()`, `delete(key)`, plus convenience `exists(key)` with default implementation
- **Thread Safety**: Trait bound includes `Send + Sync` for use across threads
- **StorageError Variants**: NotFound, AccessDenied, ServiceUnavailable, DataCorruption, Serialization, Timeout, Io, Locked, AlreadyExists, InvalidKey, Platform
- **Error Conversions**: `From<std::io::Error>` and `From<serde_json::Error>` implemented for convenience
- **Testing Pattern**: MockStorage uses `RwLock<HashMap<String, Vec<u8>>>` for in-memory testing

## Chains Module

- **ChainProvider Trait**: Async trait with `#[async_trait]` for blockchain interactions
- **Core Methods**: `get_balance()`, `get_tokens()`, `get_nfts()`, `get_transactions()`, `estimate_fee()`, `broadcast()`, `get_transaction_status()`
- **Metadata Methods**: `chain_type()`, `chain_id()`, `chain_name()`, `native_symbol()`, `explorer_url()`
- **Default Implementations**: `tx_explorer_url()` and `address_explorer_url()` generate explorer links
- **ChainType Enum**: `Evm` and `Solana` variants, serializes as lowercase strings
- **ChainError Variants**: Rpc, Timeout, RateLimited, InvalidAddress, InvalidResponse, ChainIdMismatch, InsufficientBalance, TransactionRejected, TransactionNotFound, NonceConflict, NetworkUnavailable, ProviderNotFound, Provider, Serialization
- **Error Helpers**: Constructor methods like `ChainError::rpc()`, `timeout()`, `rate_limited()` for convenience
- **Error Classification**: `is_transient()` returns true for Timeout/RateLimited/NetworkUnavailable (retry-able errors)
- **Balance Type**: `Balance { amount: String, decimals: u8, symbol: String }` - amount as string for large numbers
- **TokenBalance Type**: Contract address, name, symbol, decimals, balance, optional logo_url
- **Nft Type**: Contract/mint address, token_id, name, description, image/animation URLs, collection_name, attributes
- **Fee Type**: Generic fee with optional chain-specific `FeeDetails::Evm` or `FeeDetails::Solana`
- **EvmFeeDetails**: gas_limit, max_fee_per_gas, max_priority_fee_per_gas (EIP-1559)
- **SolanaFeeDetails**: base_fee, optional priority_fee and compute_units
- **TxStatus Enum**: Pending, Confirmed, Failed, Reorged - serializes as lowercase
- **UnsignedTx/SignedTx**: Chain type + opaque byte data, with optional description for UnsignedTx
- **Thread Safety**: ChainProvider is `Send + Sync` for concurrent use across threads

## Chain Registry

- **Location**: `draupnir-chains/src/registry.rs` and `draupnir-chains/src/config.rs`
- **ChainConfig Struct**: Configuration for a blockchain network - id, name, chain_type, chain_id, rpc_url, native_symbol, native_decimals, explorer_url, is_testnet, is_builtin, icon_url
- **Builder Pattern**: `ChainConfig::evm(chain_id, name, rpc_url, symbol)` and `ChainConfig::solana(cluster, name, rpc_url)` with chainable modifiers
- **Modifiers**: `.with_explorer()`, `.as_testnet()`, `.as_custom()`, `.with_icon()`
- **ChainRegistry Struct**: Holds `HashMap<String, ChainConfig>` keyed by chain ID string
- **Built-in EVM Chains**: Ethereum Mainnet (1), Sepolia (11155111), Arbitrum One (42161), Optimism (10), Base (8453), Polygon (137)
- **Built-in Solana Networks**: mainnet-beta, devnet
- **RPC URLs**: Placeholder Alchemy/Helius URLs with "demo" API key - must be replaced in production
- **Query Methods**: `get()`, `get_or_err()`, `all()`, `evm_chains()`, `solana_networks()`, `mainnets()`, `testnets()`, `builtins()`, `custom_chains()`
- **Numeric Lookup**: `get_by_chain_id(u64)` for EVM chains by numeric ID
- **Custom Chain Management**: `add_custom()` (fails if ID exists), `remove_custom()` (fails for builtins), `update_custom()` (fails for builtins)
- **Protection**: Built-in chains have `is_builtin: true` and cannot be removed or modified
- **Native Decimals**: EVM chains use 18 decimals, Solana uses 9 decimals
- **Polygon Native Token**: Changed from MATIC to POL per 2024 rebranding

## Logging Module

- **Location**: `draupnir-app/src/logging.rs` - tracing infrastructure centralized in the app crate
- **Initialization**: `init_tracing()` returns `LogGuard` that must be held for app lifetime
- **Log Directories**: Platform-specific using `dirs` crate - macOS: `~/Library/Application Support/com.draupnir.wallet/logs`, Windows: `%APPDATA%\Draupnir\logs`, Linux: `~/.config/draupnir/logs`
- **File Format**: JSON via `tracing-subscriber` with `fmt::layer().json()` for machine parsing
- **Console Format**: Human-readable with colors for development
- **Rotation**: Daily via `tracing-appender::rolling::Rotation::DAILY`, 30-day retention via custom cleanup
- **Non-blocking**: Uses `tracing_appender::non_blocking()` for async file writes
- **Sensitive Keywords**: List of forbidden terms (private, seed, mnemonic, password, etc.) for validation
- **Environment Filter**: `RUST_LOG` env var, defaults to `info,draupnir=debug`
- **TracingError**: Enum with `CreateLogDir` and `AlreadyInitialized` variants

## Core Module

- **Location**: `draupnir-core/src/` - wallet and account management
- **WalletManager**: Central struct for wallet operations - create_wallet(), import_wallet(), derive_account(), unlock(), lock()
- **Wallet Struct**: id (Uuid), name (String), created_at (DateTime<Utc>), accounts (Vec<Account>)
- **Account Struct**: index (u32), evm_address (String), solana_address (String)
- **EncryptedSeed Struct**: version (u8), salt (Vec<u8>), encrypted_data (EncryptedData) - for SecureStorage
- **WalletsMetadata**: Schema for wallets.json file - version, wallets array, active_wallet_id
- **WalletError Enum**: InvalidMnemonic, DerivationFailed, EncryptionFailed, DecryptionFailed, Storage, NotFound, AlreadyExists, NoActiveWallet, Locked, InvalidName, InvalidPassword, Serialization
- **Password Validation**: Uses draupnir_crypto::validate_password() - 12+ chars, uppercase, lowercase, number
- **Name Validation**: Non-empty after trim, max 50 characters
- **Encryption Flow**: generate_salt() -> derive_key(password, salt) -> encrypt(mnemonic, derived_key)
- **Derivation**: Uses derive_evm_key() and derive_solana_key() at index for each account
- **Borrow Pattern**: For derive_account(), get index first (immutable borrow), derive keys, then mutably add account to avoid borrow checker issues
- **Unlock Flow**: unlock(wallet_id, password, encrypted_seed) -> derive_key -> decrypt -> validate_mnemonic -> derive keys for all accounts -> store in unlocked_wallets HashMap
- **Lock Flow**: lock(wallet_id) removes from HashMap, keys auto-zeroized via Drop on EvmKeyPair/SolanaKeyPair
- **UnlockedWalletKeys**: Internal struct with HashMap<u32, EvmKeyPair> and HashMap<u32, SolanaKeyPair> keyed by account index
- **Key Access**: get_evm_keypair(wallet_id, account_index) and get_solana_keypair() return WalletError::Locked if wallet not unlocked
- **Lock Helpers**: is_locked(), is_unlocked(), unlocked_count(), lock_all() for auto-lock timer
- **Zeroizing Import**: Use `secrecy::zeroize::Zeroizing` for secure strings (not direct `zeroize` crate import)
- **Decrypt Utility**: WalletManager::decrypt_mnemonic() static method for seed phrase display without full unlock

## Tauri Module

- **Location**: Tauri 2.0 configuration in `tauri.conf.json` at project root
- **App Identifier**: `com.draupnir.wallet` - used for Keychain, log directories, etc.
- **Frontend Path**: `frontend/` directory with Svelte 5 + Vite
- **Build Config**: `frontendDist: "frontend/dist"`, dev server at `localhost:5173`
- **Context Path**: `tauri::generate_context!("../../tauri.conf.json")` from `crates/draupnir-app/src/main.rs`
- **Build.rs**: Required for Tauri - `tauri_build::build()` in `crates/draupnir-app/build.rs`
- **Windows Subsystem**: Use `#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]` to hide console on Windows release builds
- **System Dependencies**: Tauri requires platform-specific native libraries (GTK/WebKit on Linux, WebView2 on Windows, WebKit on macOS)
- **Svelte 5**: Uses `mount()` from svelte instead of `new App({ target })` for mounting components
- **Vite Plugin**: `@sveltejs/vite-plugin-svelte` version must match Vite major version (v5 for Vite 6)
- **Path Aliases**: `$lib` alias configured in both `vite.config.ts` (resolve.alias) and `tsconfig.json` (paths) for `import from '$lib/...'`

## Design System (Asgard Protocol)

- **Location**: `frontend/src/app.css` - global CSS variables and base styles
- **Theme**: Dark by default with Norse-cyberpunk aesthetic
- **Primary Colors**: `--color-void-black` (#0a0a0f), `--color-rune-gray` (#1a1a24), `--color-mist-gray` (#2a2a38), `--color-ash-gray` (#6b6b7a), `--color-frost-white` (#e8e8f0)
- **Accent Colors**: `--color-bifrost-cyan` (#00f5ff), `--color-valhalla-gold` (#ffd700), `--color-odin-purple` (#9d4edd), `--color-ragnarok-red` (#ff3366), `--color-yggdrasil-green` (#00ff88)
- **Gradients**: `--gradient-bifrost` (cyan→purple), `--gradient-valhalla` (gold→orange), `--gradient-void` (radial depth)
- **Font Stacks**: `--font-primary` (Inter), `--font-mono` (JetBrains Mono), `--font-display` (Cinzel for Norse headers)
- **Typography Scale**: Display 32px, H1 24px, H2 20px, H3 16px, Body 14px, Caption 12px, Micro 10px
- **Spacing Scale**: `--space-1` (4px) through `--space-16` (64px)
- **Transitions**: `--transition-fast` (150ms), `--transition-normal` (200ms), `--transition-slow` (300ms)
- **Reduced Motion**: Media query respects `prefers-reduced-motion: reduce` by disabling animations
- **Focus Styles**: 2px solid Bifrost cyan outline with 2px offset for accessibility

## UI Components (Svelte 5)

- **Location**: `frontend/src/lib/components/` - reusable Svelte 5 components
- **Import Pattern**: Export from `index.ts` for clean imports: `import { Button, Card } from '$lib/components'`
- **Props Pattern**: Use `$props()` with interface extending HTML element attributes, e.g., `interface Props extends HTMLButtonAttributes`
- **Snippets**: Use `Snippet` type from svelte for slot-like children: `children: Snippet`
- **Derived Values**: Use `$derived()` for computed values that depend on props
- **State**: Use `$state()` for component-local reactive state
- **Button**: Primary (Bifrost gradient + glow), Secondary (ghost + border), Danger (Ragnarok red); supports loading state with spinner
- **Card**: Rune Gray background, optional title/icon/header/footer snippets, `glow` prop for cyan accent
- **Input**: Label, hint, error states; password toggle; Bifrost cyan focus glow; size variants (sm/md/lg)
- **Modal**: Native `<dialog>` element; closes on Escape; backdrop click optional; focus restoration on close
- **Toast**: Module-level state via `$state<ToastData[]>()`; slide-in animation; auto-dismiss; `toast()` function export
- **Skeleton**: Text (with multi-line support), Circle, Rect variants; shimmer animation
- **Accessibility**: All components include aria attributes, focus styles, and reduced-motion support

## UI Pages

- **Location**: `frontend/src/pages/` - application screens and flows
- **Welcome Page**: `Welcome.svelte` - first-launch onboarding screen with Create/Import options
- **App Routing**: `App.svelte` uses `$state()` for simple screen state management (welcome/create-wallet/import-wallet/dashboard)
- **Page Props**: Pages receive callback props for navigation, e.g., `onCreateWallet: () => void`
- **Export Pattern**: Export from `pages/index.ts` for clean imports: `import { Welcome } from './pages'`

## AppState Module

- **Location**: `draupnir-app/src/state.rs` - application state management
- **AppState Struct**: Holds `wallet_manager: RwLock<WalletManager>`, `chain_registry: ChainRegistry`, `config: RwLock<Config>`
- **Locking Strategy**: WalletManager and Config use RwLock for concurrent reads with exclusive writes; ChainRegistry is immutable after init
- **Config Struct**: auto_lock_minutes (u32), biometric_enabled (bool), display_currency (String), show_testnets (bool), version (u32)
- **Default Config**: auto_lock=5min, biometric=false, currency="USD", testnets=false, version=1
- **Initialization**: `AppState::new()` creates empty WalletManager, loads ChainRegistry with builtins, default Config
- **Alternative Constructors**: `with_wallet_manager()` and `with_manager_and_config()` for loading persisted data
- **Helper Methods**: `wallet_count()`, `has_unlocked_wallet()`, `lock_all_wallets()` - all return `Result<_, AppError>`
- **Tauri Integration**: Pass to Tauri via `.manage(app_state)`, access in commands via `State<'_, AppState>`

## AppError Module

- **Location**: `draupnir-app/src/error.rs` - unified error type for Tauri commands
- **Variants**: Wallet (from WalletError), Chain (from ChainError), Storage (from StorageError), Config (String), Init (String), State (String)
- **From Impls**: Automatic conversion from WalletError, ChainError, StorageError via `#[from]`
- **Serialization**: Implements `Serialize` by serializing as error message string for frontend consumption
- **Helper Constructors**: `AppError::config()`, `init()`, `state()` for convenience

## Tauri Commands Module

- **Location**: `draupnir-app/src/commands.rs` - wallet operations exposed to frontend
- **Command List**: create_wallet, import_wallet, unlock_wallet, lock_wallet, get_wallets, get_addresses, get_active_wallet, set_active_wallet, is_wallet_unlocked, lock_all_wallets
- **Async Commands**: All commands use `async fn` with `#[tauri::command]` attribute
- **State Access**: Commands receive `State<'_, AppState>` and `State<'_, SeedStorage>` via Tauri's state injection
- **Locking Pattern**: Acquire RwLock (read for queries, write for mutations), release before returning
- **SeedStorage**: Temporary in-memory `RwLock<HashMap<Uuid, EncryptedSeed>>` for encrypted seeds; will be replaced by storage-002/003
- **Response Types**: `CreateWalletResponse` (wallet + mnemonic), `WalletAddresses`, `AccountAddresses` - all derive Serialize/Deserialize
- **Word Count Validation**: create_wallet accepts u8 (12 or 24), validates before calling WalletManager
- **Error Handling**: All errors convert to `AppError` via `?` operator, serialized as strings for frontend
- **Frontend Invocation**: `invoke('create_wallet', { name, password, wordCount })` from @tauri-apps/api/core
- **Tracing**: Commands use `#[instrument]` for structured logging, skip sensitive params (password, mnemonic)

## Wallet Creation Flow (UI)

- **Location**: `frontend/src/lib/components/create-wallet/` - 5-step wallet creation flow
- **Components**: PasswordSetup, SeedDisplay, SeedVerify, WalletName, WalletSuccess - each handles one step
- **Orchestrator**: `frontend/src/pages/CreateWallet.svelte` - manages flow state and step transitions
- **Flow Steps**: password → seed-display → seed-verify → name → success
- **Password Validation**: Uses regex checks for 12+ chars, uppercase, lowercase, number; strength meter shows Weak/Medium/Strong
- **Seed Display Timer**: 60-second countdown with $effect(), navigates back when expired for security
- **Clipboard Handling**: Copy mnemonic with 60-second auto-clear timer using setTimeout chains
- **Seed Verification**: 3 random positions generated on mount, shuffled word options, tracks failed attempts
- **Input Binding**: Input component needs `value = $bindable('')` in Props for `bind:value` to work in parent
- **Toast Signature**: `toast(type, message)` not `toast(message, type)` - type first, then message string
- **Effect Cleanup**: Use return function in `$effect()` to clear timeouts: `return () => { if (timeoutId) clearTimeout(timeoutId); }`
- **Accessibility Labels**: Use `<span>` with `id` attribute and `aria-labelledby` instead of `<label>` for non-input controls

## Wallet Import Flow (UI)

- **Location**: `frontend/src/lib/components/import-wallet/` - mnemonic input with BIP-39 auto-suggest
- **Components**: MnemonicInput - single component for mnemonic entry with validation
- **Orchestrator**: `frontend/src/pages/ImportWallet.svelte` - manages 4-step import flow
- **Flow Steps**: password → mnemonic → name → success (reuses PasswordSetup, WalletName, WalletSuccess from create-wallet)
- **BIP-39 Wordlist**: Embedded 2048-word array in MnemonicInput.svelte for client-side auto-suggest
- **Auto-Suggest**: Filters wordlist with `startsWith()` on current word, shows up to 6 matches
- **Keyboard Navigation**: Arrow keys for selection, Tab/Enter to select suggestion, selectedSuggestionIndex tracks selection
- **Word Mode Toggle**: 12/24 word selector buttons, mode affects expected word count validation
- **Word Validation**: Real-time check against BIP-39 wordlist, invalid words highlighted in word preview chips
- **Word Preview**: Grid of numbered word chips showing parsed input, invalid words have red border
- **Error Messages**: Show first error only to avoid overwhelming user; checksum validation done server-side
- **Paste Support**: Default textarea paste behavior works, validation updates on input change
- **Mnemonic Normalization**: Before submission, normalize to lowercase single-space separated words

## Unlock Screen (UI)

- **Location**: `frontend/src/pages/UnlockScreen.svelte` - password entry to unlock locked wallet
- **Props**: walletId (string), walletName (string), onUnlock (callback), onForgotPassword (optional callback), touchIdAvailable (boolean)
- **Password Input**: Reuses Input component with `type="password"` and `showToggle={true}`
- **Touch ID**: Button shown when touchIdAvailable=true; actual biometric implementation in security-002
- **Error Handling**: Catches unlock_wallet command errors, shows "Incorrect password" for decryption failures
- **Failed Attempts**: Tracks failedAttempts count, shows warning message after 3+ failures
- **Routing**: App.svelte has 'unlock' screen state, handleWalletLocked(walletId, walletName) triggers unlock screen
- **Forgot Password**: Optional callback prop for navigating to password recovery flow (shows warning about recovery phrase)

## macOS Keychain Storage

- **Location**: `draupnir-storage/src/macos.rs` - macOS Keychain-based SecureStorage implementation
- **Crate**: Uses `security-framework` v2 for Keychain access (target-specific dependency for macOS only)
- **Service Name**: `com.draupnir.wallet` - all Keychain entries use this service identifier
- **API Methods**: `set_generic_password()`, `get_generic_password()`, `delete_generic_password()` from security-framework
- **Error Codes**: -25300 (errSecItemNotFound) -> NotFound, -25308 (errSecInteractionNotAllowed) -> Locked, -25293 (errSecAuthFailed) -> AccessDenied
- **List Limitation**: security-framework doesn't support Keychain enumeration; callers should use wallets.json for wallet list
- **Delete Behavior**: Idempotent - returns Ok(()) even if key doesn't exist (no error on missing key)
- **Store Behavior**: Overwrites existing entry if key already exists (no separate update method needed)
- **Testing**: Use `with_service()` constructor with test-specific service name to avoid polluting production Keychain
- **Conditional Compilation**: Module wrapped in `#[cfg(target_os = "macos")]` to only compile on macOS

## File Storage Module

- **Location**: `draupnir-storage/src/file.rs` - JSON file persistence for non-sensitive app data
- **FileStorage Struct**: Manages JSON files in platform-specific data directory
- **Platform Paths**: macOS `~/Library/Application Support/com.draupnir.wallet/`, Windows `%APPDATA%\Draupnir\`, Linux `~/.config/draupnir/`
- **Constructor**: `FileStorage::new()` creates storage with platform-specific path, `with_base_dir()` for custom/test paths
- **Atomic Writes**: `save(filename, data)` writes to `.tmp` file, then atomic rename to target path
- **Load Methods**: `load(filename)` returns `StorageError::NotFound` or `DataCorruption`, `load_or_default(filename)` returns Default on missing/corrupted
- **Corruption Handling**: Corrupted files backed up to `.bak` extension before returning default
- **Additional Methods**: `delete()` (idempotent), `exists()`, `path()` (full path for filename), `list_files()` (JSON files only), `cache_dir()` (creates cache subdirectory)
- **Dependencies**: Uses `dirs` crate for platform paths, `tempfile` dev-dependency for tests
- **Pretty Print**: JSON saved with `serde_json::to_string_pretty()` for human readability

## Config Module

- **Location**: `draupnir-app/src/state.rs` - Config struct and persistence functions
- **Config Fields**: version (u32), display_currency (String), locale (String), theme (String), auto_lock_seconds (u32), biometric_enabled (bool), show_testnet (bool), default_evm_chain (u64), default_solana_cluster (String), last_opened (DateTime<Utc>)
- **Default Values**: version=1, display_currency="USD", locale="en-US", theme="dark", auto_lock_seconds=300, biometric_enabled=false, show_testnet=false, default_evm_chain=1, default_solana_cluster="mainnet-beta"
- **Config Filename**: `config.json` stored in platform-specific data directory
- **Serialization**: Uses `serde` with `chrono` DateTime for last_opened field (ISO 8601 format)
- **AppState::initialize()**: Production initialization that loads config from disk, updates last_opened, and saves
- **AppState::update_config()**: Closure-based update that saves immediately to disk if file_storage is available
- **Standalone Functions**: `load_config()` and `save_config()` for use outside AppState context
- **Config::touch()**: Updates last_opened to current time
- **Field Naming**: Uses snake_case matching data-persistence.md spec (auto_lock_seconds not auto_lock_minutes)

## Dashboard Layout

- **Location**: `frontend/src/pages/Dashboard.svelte` - main application layout after wallet creation/unlock
- **Layout Structure**: CSS Grid with areas: header, sidebar, main, footer (status bar)
- **Grid Definition**: `grid-template-areas: "header header" "sidebar main" "footer footer"` with header 64px, footer auto, sidebar 240px
- **Header Elements**: DRAUPNIR branding (logo with Bifrost gradient), NetworkSelector component (ui-014), user menu
- **Sidebar Elements**: Wallet selector (ui-015 placeholder), navigation items (Assets, History, Settings), quick actions (Send, Receive)
- **Navigation State**: Uses `activeNav` state with type `'assets' | 'history' | 'settings'` for highlighting
- **Responsive Breakpoints**: Compact (<800px) sidebar collapses with hamburger menu, Default (800-1200px) standard, Wide (>1200px) expanded
- **Sidebar Collapse**: Mobile uses `position: fixed` with transform animation, desktop uses grid column width transition
- **Status Bar**: Connection indicator (connected/slow/offline with colored glow), last sync timestamp
- **Content Placeholder**: Skeleton components with shimmer animation for balance and token list (until ui-006)
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` disables logo glow and skeleton animations
- **Chain Data Loading**: Uses `$effect()` to load chains on mount via `invoke('get_chains')`, sets `chainConnectionStatus` to 'unknown' initially

## Network Selector Component

- **Location**: `frontend/src/lib/components/NetworkSelector.svelte` - dropdown for selecting blockchain networks
- **ChainConfig Interface**: Matches backend ChainConfig struct with id, name, chain_type, chain_id, rpc_url, native_symbol, native_decimals, explorer_url, is_testnet, is_builtin, icon_url
- **Props**: chains (ChainConfig[]), selectedChainId (bindable), showTestnets, connectionStatus (Record<string, status>), onselect callback, disabled
- **Grouping Logic**: Groups by evmMainnets, evmTestnets, solanaNetworks, customChains using `$derived()` with filters
- **Chain Icons**: EVM chains use `◆`, Solana uses `◈` (distinguished by chain_type)
- **Status Indicator**: Small dot with colors: connected (green), slow (gold), offline (red), unknown (gray)
- **Dropdown Behavior**: Toggle on button click, close on outside click or Escape key, uses `$effect()` for event listeners
- **Testnet Visibility**: When showTestnets=false, testnets are filtered out via `visibleChains` derived state
- **Custom Networks**: Shown with edit icon (✎), grouped separately at bottom
- **Add Network**: Button placeholder at bottom of dropdown (implementation in ui-012)
- **Accessibility**: Uses role="listbox" and aria-expanded for dropdown, role="option" for items

## EVM Provider (alloy)

- **Location**: `draupnir-evm/src/provider.rs` - EVM chain provider implementation using alloy
- **Crate Version**: alloy v1.4+ - API changed significantly from earlier versions and examples
- **Provider Type**: Use `RootProvider` (not `ReqwestProvider` which doesn't exist in v1)
- **Constructor**: `RootProvider::new_http(url)` for HTTP RPC, not `ProviderBuilder::new().on_http(url)`
- **ProviderBuilder**: Still exists but `on_http()` was renamed to `connect_http()`, returns different type
- **Network Default**: `RootProvider<N: Network = Ethereum>` - defaults to Ethereum, no need to specify
- **Import Pattern**: `use alloy::providers::{Provider, RootProvider}` for core types
- **Type Inference**: Provider methods generally work without explicit type annotations after correct provider construction
- **get_balance**: Returns `U256`, no type annotation needed: `provider.get_balance(addr).await`
- **get_block_by_number**: Takes `BlockNumberOrTag::Latest`, returns `Option<Block>` with header containing `base_fee_per_gas: u64`
- **estimate_gas**: Takes ownership of TransactionRequest, use `.clone()` if needed
- **get_max_priority_fee_per_gas**: Returns `u128` for max priority fee
- **send_raw_transaction**: Returns pending transaction with `.tx_hash()` method
- **get_transaction_receipt**: Returns `Option<TransactionReceipt>` with `.status()` bool method
- **EIP-1559 Fee Estimation**: Calculate `max_fee = base_fee * 2 + priority_fee` as common heuristic
- **Error Mapping**: Use ChainError variants for provider errors: `ChainError::rpc()`, `invalid_address()`, etc.
- **EvmError Enum**: Custom error type in `error.rs` with variants for RPC, URL, ChainId, Address, Transaction, Timeout

## Solana Provider (JSON-RPC)

- **Location**: `draupnir-solana/src/provider.rs` - Solana ChainProvider implementation
- **No solana-client**: Uses direct JSON-RPC via reqwest to avoid OpenSSL dependency from solana-sdk
- **TLS**: reqwest configured with `rustls-tls` feature (no OpenSSL needed)
- **RPC Request Format**: JSON-RPC 2.0 with `RpcRequest<T>` struct containing jsonrpc, id, method, params
- **RPC Response Format**: `RpcResponse<T>` with optional result and error fields
- **Connection Validation**: `getGenesisHash` RPC call on construction to verify connectivity
- **Balance**: `getBalance` RPC returns `GetBalanceResult { value: u64 }` (lamports)
- **Fee Estimation**: Base fee 5000 lamports + `getRecentPrioritizationFees` for priority fee
- **Transaction Broadcast**: `sendTransaction` with base58 encoding, confirmed preflight commitment
- **Transaction Status**: `getSignatureStatuses` returns confirmation status (finalized/confirmed/processed)
- **Explorer URLs**: Custom generation with `?cluster={cluster}` query param for non-mainnet clusters
- **SolanaError Enum**: Variants for RpcConnection, InvalidRpcUrl, ClusterMismatch, RpcRequest, InvalidAddress, TransactionFailed, Timeout
- **Commitment**: Uses "confirmed" commitment for balance queries and transaction status

## Chain Commands (Tauri)

- **Location**: `draupnir-app/src/commands.rs` - chain/network related Tauri commands
- **get_chains()**: Returns all ChainConfig from chain_registry.all().cloned().collect()
- **get_selected_chains()**: Returns SelectedChains struct with evm_chain_id and solana_cluster from Config
- **set_selected_evm_chain(chain_id)**: Validates chain exists and is EVM, updates config.default_evm_chain
- **set_selected_solana_cluster(cluster)**: Validates chain exists and is Solana, updates config.default_solana_cluster
- **get_show_testnets()** / **set_show_testnets(show)**: Read/write config.show_testnet preference
- **SelectedChains Struct**: Response type with evm_chain_id (String) and solana_cluster (String)
- **Validation**: Commands verify chain exists in registry and is correct type before updating config

## Chain Operation Commands (Tauri)

- **Location**: `draupnir-app/src/commands.rs` - balance, tokens, NFT, fee, transaction commands
- **ProviderRegistry**: `draupnir-app/src/providers.rs` - manages chain providers with lazy creation and caching
- **TimeoutProvider**: Wrapper around ChainProvider that adds 30-second timeout to all operations
- **get_balance(chain_id, address)**: Returns BalanceResponse with balance, chain_id, chain_type
- **get_tokens(chain_id, address)**: Returns TokensResponse with tokens array (placeholder until evm-002/solana-002)
- **get_nfts(chain_id, address)**: Returns NftsResponse with nfts array (placeholder until evm-004/solana-004)
- **estimate_fee(chain_id, tx)**: Returns FeeResponse with fee details (EVM or Solana-specific)
- **send_transaction(chain_id, tx)**: Returns BroadcastResponse with tx_hash and optional explorer_url
- **get_transaction_status(chain_id, tx_hash)**: Returns TxStatusResponse with pending/confirmed/failed status
- **get_balances_multi(chain_ids, addresses)**: Concurrent balance fetches using futures::join_all
- **Provider Creation**: Providers created lazily on first use via get_or_create(), cached in HashMap<String, Arc<BoxedProvider>>
- **Timeout Handling**: All operations wrapped with tokio::time::timeout, returns ChainError::timeout on expiry
- **Response Types**: BalanceResponse, TokensResponse, NftsResponse, FeeResponse, BroadcastResponse, TxStatusResponse
- **Error Mapping**: ChainError converts to AppError via From impl, serialized as string for frontend

## ERC-20 Token Module

- **Location**: `draupnir-evm/src/erc20.rs` - ERC-20 contract interaction via raw eth_call
- **Function Selectors**: Hardcoded 4-byte selectors for balanceOf (0x70a08231), decimals (0x313ce567), symbol (0x95d89b41), name (0x06fdde03)
- **ABI Encoding**: `encode_balance_of(owner)` creates 36-byte call data (4 selector + 32 address)
- **ABI Decoding**: `decode_uint256`, `decode_uint8`, `decode_string` with bytes32 fallback for legacy contracts
- **String Handling**: Standard ABI strings have offset→length→data; some older contracts return raw bytes32
- **Decimals Validation**: Rejects tokens with decimals > 77 per spec, accepts 0-18 (and beyond)
- **Symbol Truncation**: Symbols > 20 chars truncated with ellipsis per spec
- **get_token_balance()**: Fetches balance for single token/owner pair
- **get_token_metadata()**: Fetches name, symbol, decimals with error handling for missing fields
- **get_token_info()**: Combined metadata + balance fetch for single token
- **get_token_balances()**: Parallel fetches via futures::join_all, skips zero balances and errors
- **Known Tokens Module**: `erc20::known_tokens::for_chain(chain_id)` returns popular token addresses
- **Chain Coverage**: Ethereum (USDC, USDT, DAI, WETH), Arbitrum, Optimism, Base, Polygon
- **EvmProvider Integration**: `get_tokens()` uses known tokens list, `get_single_token()` for custom tokens
- **Testing**: sha3 crate in dev-dependencies for selector verification via Keccak256

## SPL Token Module

- **Location**: `draupnir-solana/src/spl.rs` - SPL token balance fetching via JSON-RPC
- **RPC Method**: `getTokenAccountsByOwner` with `jsonParsed` encoding for pre-decoded token data
- **Token Programs**: Queries both SPL Token Program (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`) and Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)
- **Response Parsing**: Nested struct hierarchy: GetTokenAccountsResult → TokenAccountInfo → AccountData → ParsedData → ParsedTokenData → TokenInfo → TokenAmount
- **TokenAmount Fields**: amount (string u64), decimals (u8), ui_amount (f64), ui_amount_string - use amount + decimals for consistent handling
- **get_token_balances()**: Fetches all token accounts for owner, filters zero balances, returns Vec<TokenBalance>
- **get_mint_info()**: Queries `getAccountInfo` for mint account to get decimals and supply
- **get_single_token_balance()**: Fetches balance for specific mint address
- **Known Tokens**: `spl::known_tokens::for_cluster(cluster)` returns known tokens for cluster
- **Mainnet Tokens**: USDC, USDT, BONK, JUP, PYTH with mint addresses and metadata
- **Unknown Tokens**: Uses truncated mint address as name/symbol (e.g., "EPjFWdd5..." for unknown mints)
- **KnownToken Struct**: mint (&'static str), symbol, name, decimals - compile-time constants
- **Program ID Validation**: Both TOKEN_PROGRAM_ID and TOKEN_2022_PROGRAM_ID decode to valid 32-byte public keys
- **SolanaProvider Integration**: `get_tokens()` method calls `spl::get_token_balances()` with client and rpc_url

## EVM Transaction Error Handling

- **Nonce Conflict Detection**: `EvmProvider::is_nonce_conflict_error()` detects nonce-related RPC errors
- **Error Patterns**: "nonce too low", "nonce too high", "replacement transaction underpriced", "already known", "transaction nonce"
- **ChainError::NonceConflict**: Specific error type for nonce conflicts, returned from broadcast() when detected
- **Error Constructor**: `ChainError::nonce_conflict(message)` for creating nonce conflict errors
- **EvmError::NonceConflict**: Crate-specific variant that converts to ChainError::NonceConflict
- **Not Transient**: Nonce conflicts are not transient errors - they require user intervention (wait, speed-up, or cancel)

## Implementation Status (2026-01-16 Planning Session)

- **Completed Tasks Discovered**: core-007 (account derivation), core-008 (wallet rename), solana-003 (tx submission) were already implemented but not marked complete
- **New Tasks Identified**: docs-001 (README.md), evm-006 (EVM tx history), solana-006 (Solana tx history)
- **get_transactions() Stubs**: Both EvmProvider and SolanaProvider have stub implementations returning empty Vec - requires indexer integration
- **Missing README**: No README.md at project root despite specs/documentation.md requirements
- **Frontend Completion**: ~50% of planned UI implemented - onboarding complete, dashboard complete, send/receive/settings missing
- **Storage Completion**: macOS Keychain complete, Windows/Linux storage not implemented, cache layer not implemented
- **NFT Support**: EVM uses Alchemy NFT API v3, Solana uses Helius DAS API - both fully implemented

## Tauri Command Registration

- **Commands Registered**: 38 total commands in main.rs invoke_handler
- **Wallet Commands**: create_wallet, import_wallet, unlock_wallet, lock_wallet, get_wallets, get_addresses, get_active_wallet, set_active_wallet, is_wallet_unlocked, lock_all_wallets
- **Chain Commands**: get_chains, get_selected_chains, set_selected_evm_chain, set_selected_solana_cluster, get_show_testnets, set_show_testnets
- **Balance Commands**: get_balance, get_tokens, get_nfts, estimate_fee, send_transaction, get_transaction_status, get_balances_multi
- **Price Commands**: get_token_price, get_token_prices, get_native_token_coingecko_id, get_token_coingecko_id, get_supported_currencies, clear_price_cache, get_price_cache_stats
- **Auto-Lock Commands**: record_activity, get_auto_lock_timeout, set_auto_lock_timeout, get_seconds_until_lock, get_auto_lock_status
- **Provider Registry**: ProviderRegistry in `draupnir-app/src/providers.rs` with lazy creation and 30-second timeout wrapper

## Price Module

- **Location**: `draupnir-core/src/price.rs` - CoinGecko price fetching with caching and rate limiting
- **PriceService**: Main struct managing HTTP client, cache, and rate limiter
- **Configuration**: PriceServiceConfig with cache_ttl_secs (60), max_batch_size (100), min_request_delay_ms (3000), max_retries (3), backoff_base_ms (1000)
- **API Endpoints**: Free tier uses `api.coingecko.com`, Pro tier uses `pro-api.coingecko.com` with x-cg-pro-api-key header
- **Caching**: HashMap<String, CachedPrice> with Instant-based expiration, key format is `{coin_id}:{currency}`
- **Rate Limiting**: RateLimiter tracks last_request time and backoff_multiplier (1 → 2 → 4 → 8 → 16 max)
- **Exponential Backoff**: On rate limit (HTTP 429), multiplier doubles; on success, resets to 1
- **TokenPrice Struct**: id, price, change_24h, market_cap, volume_24h, last_updated (ISO 8601)
- **Token ID Mappings**: token_ids module with LazyLock HashMaps for native tokens (by chain_id), ERC-20 (by contract address), SPL (by mint address)
- **Native Token IDs**: Ethereum (1, 42161, 10, 8453) → "ethereum", Polygon (137) → "matic-network", Solana → "solana"
- **Currency Enum**: Usd (default), Eur, Gbp, Jpy, Cny - with code() and symbol() methods
- **PriceError Variants**: Http, RateLimited, InvalidResponse, NotFound, Timeout, Internal
- **Environment Variable**: COINGECKO_API_KEY optional, enables Pro API endpoint when set

## Single Instance Enforcement

- **Location**: Plugin initialization in `draupnir-app/src/main.rs`
- **Plugin**: `tauri-plugin-single-instance` v2 - prevents multiple app instances
- **Platform Support**: macOS, Windows, Linux only (via cfg attribute)
- **Registration Order**: Must be first plugin registered for proper operation
- **Callback**: Receives AppHandle, args, and cwd when second instance launches
- **Behavior**: Focuses main window using `app.get_webview_window("main")?.set_focus()`
- **Linux Implementation**: Uses DBus for instance communication
- **Linux Dependencies**: Requires glib-2.0 and gobject-2.0 system libraries at compile time
- **Lock Mechanism**: Platform-specific (DBus on Linux, named mutex on Windows, file lock on macOS)
- **Lock Cleanup**: Automatically released on normal exit and on crash (not stale)

## Auto-Lock Timer

- **Location**: `draupnir-app/src/auto_lock.rs` - automatic wallet locking after inactivity
- **AutoLockManager**: Main struct with atomic state for thread-safety
- **Configuration**: Via Config.auto_lock_seconds - valid values: 0 (disabled), 60, 300 (default), 900, 1800
- **Timer Implementation**: Tokio background task with 1-second check interval
- **Activity Tracking**: `record_activity()` resets the inactivity timer (called from frontend on user interactions)
- **Lock Callback**: Calls `AppState.lock_all_wallets()` which zeroizes all keys in memory
- **State Sharing**: AppState wrapped in Arc for sharing between main thread and timer callback
- **Shutdown Signal**: Uses tokio watch channel for graceful shutdown
- **Tauri Commands**: record_activity, get_auto_lock_timeout, set_auto_lock_timeout, get_seconds_until_lock, get_auto_lock_status
- **Persistence**: Timeout saved to config.json via `state.update_config()`
- **Frontend Integration**: Frontend should call `record_activity` on user interactions (clicks, key presses, navigation)

## Recovery Phrase Viewing (app-006)

- **Location**: `draupnir-app/src/commands.rs` - view_recovery_phrase Tauri command
- **Command Signature**: `view_recovery_phrase(wallet_id: Uuid, password: String) -> Result<String, AppError>`
- **Decryption**: Uses `WalletManager::decrypt_mnemonic()` static method for secure decryption without full unlock
- **Security Logging**: Logs `info!("Recovery phrase viewed")` with wallet_id, no phrase in logs
- **Error Handling**: DecryptionFailed errors show as "Incorrect password" in frontend
- **UI Component**: `frontend/src/lib/components/ViewRecoveryPhrase.svelte` - modal with two steps
- **Step 1 (Password)**: Warning box about not sharing phrase, password input with toggle, loading state
- **Step 2 (Display)**: 60-second timer, numbered word grid, copy to clipboard with 60-second auto-clear
- **Auto-Hide**: Timer reaches 0 → toast warning → modal closes → state reset
- **State Reset**: On close, password and mnemonic cleared from component state
- **Integration**: Added to Dashboard.svelte settings section with "View Phrase" button
- **Settings Section**: Partial implementation of ui-011 in Dashboard for recovery phrase viewing

## Receive Screen (ui-008)

- **Location**: `frontend/src/lib/components/ReceiveScreen.svelte` - modal for receiving funds
- **QR Code Library**: Uses `qrcode` npm package for client-side QR generation via `QRCode.toDataURL()`
- **QR Code Colors**: Dark = Frost White (#e8e8f0), Light = Rune Gray (#1a1a24) for Asgard Protocol theme
- **Network Selector**: Dropdown with optgroups for EVM mainnets, EVM testnets, and Solana networks
- **Address Display**: Monospace code block with full address, user-select: all for easy selection
- **Copy Button**: Uses navigator.clipboard API (browser native, no Tauri plugin needed)
- **Auto-Clear**: 60-second timeout after copy, verifies clipboard still contains copied content before clearing
- **Network Warning**: Yellow warning box showing network-specific message about not sending wrong chain assets
- **ChainConfig Type**: Uses optional `explorer_url?: string` to match NetworkSelector's type definition
- **Dashboard Integration**: Receive button in sidebar quick actions opens modal, disabled when no wallet active
- **State Management**: `localSelectedChainId` tracks modal-specific selection, synced with `selectedChainId` prop on open

## Send Flow UI (ui-007)

- **Location**: `frontend/src/lib/components/send/` - 4-step send flow components
- **Component Architecture**: AssetSelector → RecipientInput → AmountInput → ReviewTransaction, orchestrated by SendFlow.svelte
- **Asset Types**: Union type `Asset = TokenAsset | NftAsset` with type discriminator for type narrowing
- **TokenAsset Interface**: type, chainId, chainName, chainType, symbol, name, decimals, balance, contractAddress?, logoUrl?, usdValue?
- **NftAsset Interface**: type, chainId, chainName, chainType, contractAddress, tokenId, name, collectionName?, imageUrl?, quantity?
- **$state Generic Syntax**: Use `let foo = $state<Type | undefined>(undefined)` not `let foo: Type | undefined = $state(undefined)` for proper type inference
- **EVM Address Validation**: Regex `/^0x[a-fA-F0-9]{40}$/`, then EIP-55 checksum verification for mixed-case
- **Solana Address Validation**: Base58 alphabet check (no 0, O, I, l) + 32-44 character length
- **BigInt for Balances**: All token amounts use string representation with BigInt for calculations to avoid precision loss
- **Gas Buffer Calculation**: Native token sends reserve 110% of estimated gas fee for safety margin
- **Modal Size Variants**: Modal.svelte supports size prop ('sm' | 'md' | 'lg') with max-widths 360px, 480px, 640px
- **Fee Speed Selection**: FeeSpeed type = 'slow' | 'normal' | 'fast' with multipliers for EIP-1559 priority fee
- **Step State Management**: SendFlow uses `step` state with values 'select-asset' | 'recipient' | 'amount' | 'review' | 'success'
- **Address Book**: AddressBookEntry interface with id, name, address, chainType, notes?, lastUsed?
- **First-Time Recipient Warning**: Track if recipient address exists in address book, show warning if not
- **High Value Warning**: Trigger warning when USD value > $10,000
- **Type Narrowing in Svelte**: Use `{:else if asset.type !== 'nft'}` instead of `{:else}` to help TypeScript narrow union types

## Gateway Module (chains-004)

- **Location**: `draupnir-chains/src/gateway.rs` - IPFS and Arweave URI resolution
- **resolve_uri()**: Main function taking any URI string, returns `ResolvedUri` struct
- **ResolvedUri Fields**: primary (String), fallbacks (Vec<String>), original (String), uri_type (UriType)
- **UriType Enum**: Ipfs, Arweave, Http, Data, Invalid - serializes as lowercase
- **IPFS Gateways**: Primary ipfs.io, fallbacks cloudflare-ipfs.com and gateway.pinata.cloud
- **Arweave Gateway**: Single gateway arweave.net (no fallbacks)
- **URI Formats**: Handles `ipfs://CID`, `ar://txid`, `https://...`, `http://...`, `data:...`
- **Gateway URL Extraction**: Recognizes and re-resolves existing gateway URLs (e.g., `https://ipfs.io/ipfs/Qm...` → multi-gateway)
- **IPFS CID Support**: Both CIDv0 (Qm...) and CIDv1 (bafy...) with optional path components
- **Placeholder Image**: Invalid URIs return SVG data URI with "Image unavailable" text
- **Convenience Functions**: `resolve_uri_simple()` returns just primary URL, `needs_resolution()` checks if URI needs gateway, `is_valid_image_uri()` validates URI type
- **Module Export**: `pub mod gateway` in lib.rs, access via `draupnir_chains::gateway::resolve_uri`

## Wallet Selector Component (ui-015)

- **Location**: `frontend/src/lib/components/WalletSelector.svelte` - wallet switching dropdown
- **Props**: activeWallet (Wallet | null), onCreateWallet, onImportWallet, onWalletChanged callbacks, totalValue (string), disabled (boolean)
- **State Management**: isOpen for dropdown visibility, wallets array loaded via `get_wallets` Tauri command
- **Address Truncation**: `truncateAddress()` helper returns `0x1234...5678` format (6 chars + ... + 4 chars)
- **Wallet Switching**: Calls `set_active_wallet` Tauri command, triggers `onWalletChanged` callback
- **Add Account Flow**: Modal with password input, calls `derive_account` Tauri command (new command created)
- **Error Handling**: DecryptionFailed errors show "Incorrect password" message
- **Dashboard Integration**: Replaced placeholder button in sidebar, receives `onCreateWallet`/`onImportWallet` props
- **App.svelte Props**: Dashboard now receives wallet navigation callbacks from App component
- **Tauri Command**: `derive_account(wallet_id, password)` decrypts seed and calls `WalletManager::derive_account()`
- **UI Features**: Active wallet indicator (checkmark), EVM/Solana address indicators with icons, account index display

## Cache Module

- **Location**: `draupnir-storage/src/cache.rs` - caching layer with TTL and LRU eviction
- **CacheManager**: Main struct managing memory cache, disk cache, and LRU index
- **CacheType Enum**: TokenBalance (memory, 30s), Price (memory+disk, 60s), NftList (memory+disk, 5min), NftMetadata (disk, 1hr), NftImage (disk+LRU, 24hr), TokenMetadata (disk, 1wk)
- **Memory Cache**: HashMap with key=(CacheType, String), entry contains data+cached_at+ttl
- **Disk Cache**: JSON files with .meta sidecar for metadata (cached_at, ttl_secs, size_bytes)
- **LRU Index**: Persisted JSON file tracking entries sorted by last_accessed, total_size; evicts oldest when over limit
- **Sanitized Keys**: Cache keys converted to filesystem-safe names (alphanumeric + hyphen + underscore + dot)
- **CacheConfig**: Configurable TTL per data type, max LRU size (default 1GB)
- **TTL Defaults**: TOKEN_BALANCE_TTL_SECS=30, PRICE_TTL_SECS=60, NFT_LIST_TTL_SECS=300, NFT_METADATA_TTL_SECS=3600, NFT_IMAGE_TTL_SECS=86400
- **Exports**: CacheManager, CacheConfig, CacheStats, CacheType exported from draupnir_storage crate
- **Tokio Dependency**: Added tokio with "sync" feature for RwLock in async context

## Associated Token Account (ATA) Module

- **Location**: `draupnir-solana/src/ata.rs` - ATA derivation, existence check, and instruction encoding
- **PDA Derivation**: Uses SHA256 with seeds [wallet, TOKEN_PROGRAM_ID, mint] + bump byte, verified off-curve via ed25519-dalek
- **derive_ata_address()**: Takes wallet, mint, token_program; returns base58-encoded ATA address
- **check_ata_exists()**: Calls `getAccountInfo` RPC to check if account exists
- **check_ata_requirement()**: Main entry point returning AtaRequirement with needs_creation, rent_lamports, ata_address
- **Rent Cost**: TOKEN_ACCOUNT_RENT_LAMPORTS = 2_039_280 lamports (~0.00204 SOL)
- **Associated Token Program**: ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL (constant ATA_PROGRAM_ID)
- **CreateATA Instruction**: 7 accounts (payer, ata, owner, mint, system_program, token_program, ata_program), empty data
- **SPL Transfer Instruction**: 3 accounts (source_ata, dest_ata, authority), data = [12] + amount(u64) + decimals(u8)
- **Transaction Building**: `build_spl_token_transfer()` in draupnir-core creates message with 1 or 2 instructions based on needs_create_ata
- **Tauri Commands**: check_ata, derive_ata, get_token_account_rent in draupnir-app/src/commands.rs
- **Frontend Integration**: SendFlow.svelte checks ATA on review step, ReviewTransaction.svelte shows warning with rent cost

## RPC Rate Limiting and Failover Module

- **Location**: `draupnir-chains/src/rpc.rs` - RPC rate limiting and failover management
- **RateLimitConfig Struct**: min_delay_ms (100), max_requests_per_minute (30), backoff_base_ms (1000), max_retries (3)
- **RateLimiter**: Token bucket algorithm with configurable limits per endpoint, exponential backoff on rate limits (caps at 16x)
- **RateLimiter Methods**: `acquire()` waits for rate limit and returns wait duration, `on_rate_limit()` doubles backoff, `on_success()` resets backoff
- **EndpointHealth Enum**: Healthy, Slow, Unhealthy, Unknown - `is_usable()` returns true for all except Unhealthy
- **EndpointStats Struct**: total_requests, successful_requests, failed_requests, rate_limit_errors, avg_response_time_ms, consecutive_failures, health, unhealthy_since
- **RpcEndpoint**: Wraps URL with health tracking, rate limiter, and stats; marks unhealthy after 3 consecutive failures
- **Response Time Tracking**: Uses exponential moving average (alpha=0.2) for response time; marks Slow if >5000ms
- **Unhealthy Cooldown**: 60 seconds before retrying unhealthy endpoint
- **RpcManager**: Manages multiple endpoints (primary + backups) with automatic failover
- **Failover Logic**: Switches to next usable endpoint when current becomes unhealthy; cycles through all endpoints
- **execute() Method**: Wraps async operations with rate limiting, automatic retries for transient errors, and failover
- **Health Stats**: `health_stats()` returns HashMap<String, EndpointStats> for all endpoints
- **Exports**: RateLimitConfig, RateLimiter, EndpointHealth, EndpointStats, RpcEndpoint, RpcManager
- **Constants**: DEFAULT_MIN_DELAY_MS=100, DEFAULT_MAX_REQUESTS_PER_MINUTE=30, CONSECUTIVE_FAILURES_THRESHOLD=3, UNHEALTHY_COOLDOWN_SECS=60, MAX_BACKOFF_MULTIPLIER=16

## Security Audit Logging Module

- **Location**: `draupnir-app/src/security_audit.rs` - security event logging for audit trail
- **SecurityEvent Enum**: 6 variants - WalletCreated, WalletUnlocked, WalletLocked, TransactionSigned, AuthFailed, SeedExported
- **AuthMethod Enum**: Password, Biometric, None - used with WalletUnlocked and AuthFailed events
- **SecurityLogEntry**: Struct with timestamp (DateTime<Utc>) and flattened SecurityEvent
- **SecurityAuditLogger**: Writes JSON lines to security.log in platform log directory
- **Log Rotation**: Files >10MB rotated with date suffix (security.log.YYYY-MM-DD), 30-day retention cleanup on init
- **Global Logger**: OnceLock<SecurityAuditLogger> with get_security_logger() and log_security_event() convenience function
- **Integration Points**: create_wallet, import_wallet, unlock_wallet (success/failure), lock_wallet, lock_all_wallets, view_recovery_phrase, send_transaction
- **WalletManager Addition**: unlocked_wallet_ids() method to get IDs of unlocked wallets before lock_all()
- **AppState Change**: lock_all_wallets() now returns Vec<Uuid> of locked wallet IDs
- **send_transaction Change**: Added optional wallet_id parameter to enable TransactionSigned logging
- **No Sensitive Data**: Tests verify log content doesn't contain 'private', 'secret', 'seed_phrase', 'mnemonic' keywords

## Transaction Calldata Decoding

- **Location**: `draupnir-evm/src/decode.rs` - EVM transaction calldata to human-readable format
- **decode_calldata()**: Main function taking raw bytes, returns DecodedTransaction struct
- **DecodedTransaction Fields**: selector, method_name, method_signature, token_standard (Option), params (Vec<DecodedParam>), raw_calldata, is_known_method
- **DecodedParam Fields**: name (String), param_type (String), value (String)
- **ERC-20 Selectors**: transfer (0xa9059cbb), approve (0x095ea7b3), transferFrom (0x23b872dd)
- **ERC-721 Selectors**: safeTransferFrom (0x42842e0e), safeTransferFrom+data (0xb88d4fde), setApprovalForAll (0xa22cb465)
- **ERC-1155 Selectors**: safeTransferFrom (0xf242432a), safeBatchTransferFrom (0x2eb2c2d6)
- **Shared Selectors**: transferFrom used by both ERC-20 and ERC-721 (returns token_standard=None), setApprovalForAll used by ERC-721 and ERC-1155
- **Unknown Methods**: Returns is_known_method=false with selector in method_signature as "0x{hex}", empty params array
- **Helper Functions**: is_token_transfer() checks if calldata is transfer operation, is_approval() checks if approval operation
- **ABI Extraction**: extract_address() reads last 20 bytes from 32-byte slot, extract_uint256() reads full 32-byte slot, extract_bool() checks for non-zero value
- **Serialization**: DecodedTransaction and DecodedParam derive Serialize/Deserialize for frontend consumption

## TLS Security Module

- **Location**: `draupnir-chains/src/tls.rs` - TLS security and URL validation for RPC connections
- **validate_rpc_url()**: Main function validating RPC URLs, returns ValidatedUrl struct
- **HTTPS Required**: HTTP URLs rejected with TlsError::HttpNotAllowed, unsupported schemes rejected
- **TlsError Enum**: HttpNotAllowed, InvalidUrl, UnsupportedScheme, MissingHost - all with relevant details
- **ValidatedUrl Struct**: url, host, is_known_provider (bool), provider (Option<KnownProvider>)
- **KnownProvider Enum**: Alchemy, Helius - identifies trusted RPC providers
- **Alchemy Domains**: *.g.alchemy.com (eth-mainnet, eth-sepolia, arb-mainnet, opt-mainnet, base-mainnet, polygon-mainnet)
- **Helius Domains**: *.helius-rpc.com (mainnet, devnet)
- **Helper Functions**: identify_provider(host), is_known_provider(url), require_https(url)
- **Provider Integration**: EVM and Solana providers call validate_rpc_url() in new() constructor
- **Error Mapping**: TlsError::HttpNotAllowed -> EvmError::HttpNotAllowed / SolanaError::HttpNotAllowed
- **Security Log**: Unknown providers logged with warning to ensure user awareness of custom endpoints
- **Case Insensitive**: Host matching is case-insensitive for domain comparison

## Data Migration Module

- **Location**: `draupnir-storage/src/migration.rs` - JSON schema version migration framework
- **MigrationRunner**: Main struct for running migrations on a single file (e.g., config.json)
- **Constructor**: `MigrationRunner::new(filename, target_version)` creates a runner for a specific file
- **Registering Migrations**: `.register(from, to, migrate_fn)` chains migrations; must be consecutive (1→2→3, not 1→3)
- **Migration Functions**: `fn(&mut serde_json::Value)` - modify JSON in place, no return value
- **Version Detection**: Reads `version` field from JSON, defaults to 1 if missing
- **Incremental Execution**: Migrations apply one by one (v1→v2, v2→v3, etc.), never skip versions
- **Backup Creation**: Creates `.bak` file before any migration runs
- **Atomic Writes**: Uses temp file + rename pattern for safe file updates
- **MigrationResult Enum**: NoFile, Current, NewerThanApp, Migrated - with utility methods `was_migrated()`, `is_newer_than_app()`
- **MigrationManager**: Batch runner for multiple files - `run_all()` continues on error, `run_all_or_fail()` stops on first error
- **StorageError::Migration**: New error variant for migration failures (missing migration, etc.)
- **Exports**: MigrationRunner, MigrationManager, MigrationResult, Migration, MigrationFn exported from draupnir_storage crate

## Pre-Sign Transaction Validation

- **Location**: `draupnir-core/src/validation.rs` - unified transaction validation before signing
- **TransactionValidation**: Result struct with `errors` (Vec<ValidationError>) and `warnings` (Vec<ValidationWarning>)
- **ValidationError Enum**: InsufficientBalance, InvalidRecipient, InvalidSender, InvalidAmount - blocking errors
- **ValidationWarning Enum**: FirstTimeRecipient, ContractRecipient, HighValue, HighBalancePercentage, SendingToSelf, HighGasEstimate - non-blocking
- **TransactionContext**: Builder pattern struct for configuring validation context - chain type, addresses, amounts, USD values, flags
- **validate_transaction()**: Main entry point - takes TransactionContext, returns TransactionValidation with all checks performed
- **Thresholds**: HIGH_VALUE_THRESHOLD_USD = $10,000, HIGH_BALANCE_PERCENTAGE_THRESHOLD = 90%
- **Address Validation**: Uses draupnir_crypto::validate_evm_address() and validate_solana_address() based on chain type
- **Balance Validation**: Reuses builder::validate_balance() for insufficient balance check
- **EVM-Specific**: Checks recipient_is_contract, gas limit vs typical (21k transfer, 65k token, 100k contract)
- **Helper Functions**: is_contract_interaction(), is_token_transfer_calldata(), is_approval_calldata() for EVM calldata analysis
- **Calldata Selectors**: ERC-20 transfer/transferFrom, ERC-721 safeTransferFrom, ERC-1155 safeTransferFrom/batch, ERC-20 approve, setApprovalForAll
- **Exports**: validate_transaction, TransactionContext, TransactionValidation, ValidationError, ValidationWarning, helpers, constants

## Balance Refresh Module

- **Location**: `draupnir-app/src/balance_refresh.rs` - background balance polling for automatic portfolio updates
- **BalanceRefreshManager**: Main struct managing refresh state, cache, and shutdown signal
- **Refresh Interval**: REFRESH_INTERVAL_SECS = 30 seconds (configurable via constant)
- **Pause/Resume**: `pause()` and `resume()` methods for app minimize/restore events
- **Cache System**: HashMap<"{chain_id}:{address}", CachedBalance> for change detection
- **Change Detection**: `check_and_update_balance()` compares against cache, returns true only if changed
- **Event Types**: BalanceUpdatedEvent (chain_id, chain_type, amount, symbol, decimals, address), RefreshStatusEvent (success, chains_refreshed, changes_detected)
- **Tauri Events**: "balance_updated", "refresh_started", "refresh_completed" emitted via callback
- **Tauri Commands**: get_balance_refresh_status, pause_balance_refresh, resume_balance_refresh, trigger_balance_refresh, clear_balance_cache
- **Lock Check**: Start method takes `is_locked` closure to skip refresh when wallets locked
- **Thread Safety**: Uses AtomicBool for running/paused state, RwLock for cache
- **Background Task Pattern**: Similar to AutoLockManager - tokio::spawn with select! for shutdown signal
- **Pointer Pattern**: Raw pointers to atomic state passed to spawned task (safe because atomic operations)

## Address Book Module

- **Location**: `draupnir-core/src/address_book.rs` - contact management with persistence
- **AddressBookEntry**: id (Uuid), name, address, chain_type, notes (Option), created_at, last_used (Option)
- **AddressBook Struct**: In-memory manager with CRUD operations and search
- **AddressBookData**: Persistable struct with version field for migrations, contains Vec<AddressBookEntry>
- **Storage File**: `address-book.json` in platform-specific data directory
- **Validation**: Name max 50 chars, notes max 500 chars, addresses validated via draupnir_crypto::address
- **Duplicate Detection**: Case-insensitive for EVM, exact match for Solana
- **Address Normalization**: EVM addresses stored with EIP-55 checksum
- **Search**: `search(query)` matches name or address (case-insensitive)
- **Sorting**: `sorted_by_name()` alphabetical, `sorted_by_recent()` by last_used with never-used at end
- **Tauri Commands**: get_contacts, add_contact, update_contact, delete_contact, update_contact_last_used, search_contacts, get_contact_by_address, check_address_similarity
- **Persistence Pattern**: AppState.save_address_book() called after each modification
- **AppState Integration**: address_book field as RwLock<AddressBook>, loaded in AppState::initialize()
- **Frontend Type**: AddressBookEntry interface in RecipientInput.svelte matches backend fields

## Address Similarity Detection

- **Location**: `draupnir-core/src/address_book.rs` - similarity detection functions and types
- **Levenshtein Distance**: `levenshtein_distance(a, b)` computes edit distance; uses two-row optimization for memory efficiency
- **Similarity Threshold**: SIMILARITY_THRESHOLD = 3 (addresses with distance < 3 are considered similar)
- **Confusable Characters**: CONFUSABLE_GROUPS defines visually similar character sets: 0/O/o, 1/l/I/i/|, 5/S/s, 8/B, 2/Z/z, 6/G, 9/g/q
- **find_confusable_substitutions()**: Returns list of confusable character pairs found at matching positions (requires same-length strings)
- **is_similar_address()**: Checks if two addresses are similar via distance OR confusable chars
- **SimilarAddressResult**: Struct with contact_id, contact_name, contact_address, distance, has_confusable_chars, confusable_pairs
- **AddressBook::find_similar_addresses()**: Finds all similar addresses in address book, sorted by distance
- **Chain Type Handling**: EVM addresses compared case-insensitively (lowercase), Solana compared case-sensitively
- **Frontend Component**: SimilarAddressWarning.svelte modal with side-by-side comparison and difference highlighting
- **RecipientInput Integration**: Debounced async check (500ms), inline warning indicator, user confirmation flow
- **User Confirmation**: userConfirmedSimilar state tracks explicit confirmation to avoid repeated warnings

## Tauri Events System

- **Location**: Backend events in `draupnir-app/src/main.rs` setup() hook, frontend in `frontend/src/pages/Dashboard.svelte`
- **Event Types**: `balance_updated` (balance changes), `refresh_started` (cycle begins), `refresh_completed` (cycle ends with status)
- **Backend Emission**: Uses `app_handle.emit(&event_name, payload)` via `tauri::Emitter` trait
- **Frontend Subscription**: Uses `listen<T>(event_name, callback)` from `@tauri-apps/api/event`
- **Cleanup**: Store `UnlistenFn` from `listen()` and call in `$effect()` cleanup return function
- **BalanceUpdatedEvent**: chain_id, chain_type, amount, symbol, decimals, address - matches backend struct
- **RefreshStatusEvent**: success (bool), chains_refreshed (count), changes_detected (count)
- **Setup Hook Pattern**: `builder.setup(|app| { ... Ok(()) })` runs after state is managed, has access to AppHandle
- **State Access in Setup**: `app.state::<T>().inner().clone()` to get managed state
- **Async in Setup**: Use closures that return async blocks for balance refresh `fetch_balances` callback
- **Lock Check**: `is_locked` closure checks `state.has_unlocked_wallet()` to skip refresh when wallets locked
- **Refresh Trigger**: PortfolioOverview accepts `refreshTrigger` prop (number), increment to force balance reload

## Secure Enclave Module (macOS)

- **Location**: `draupnir-storage/src/enclave.rs` - macOS Secure Enclave storage with Touch ID protection
- **Crate Dependencies**: `security-framework` v2 for SecKey API, `security-framework-sys` for low-level bindings, `core-foundation` for CFTypes
- **SecureEnclaveStorage Struct**: Main struct for enclave operations with application_tag field
- **Key Generation**: Uses `GenerateKeyOptions` with `Token::SecureEnclave`, EC 256-bit keys
- **Access Control**: `SecAccessControl::create_with_protection()` with `kSecAccessControlUserPresence` flag for biometric protection
- **Encryption Algorithm**: ECIES (Elliptic Curve Integrated Encryption Scheme) with AES-GCM via `ECIESEncryptionCofactorVariableIVX963SHA256AESGCM`
- **Availability Detection**: `check_availability()` attempts test key generation to verify hardware support
- **EnclaveAvailability Enum**: `Available`, `NotAvailable` (no T2/Apple Silicon), `MissingEntitlements` (unsigned app)
- **Key Storage**: Keys stored in Keychain with application tag `com.draupnir.wallet.enclave.{wallet_id}`
- **Key Lookup**: Uses `ItemSearchOptions` with `application_tag()` filter and `load_refs(true)`
- **Key Deletion**: Uses `SecItemDelete` with CFDictionary query matching class and tag
- **Tauri Commands**: check_secure_enclave_available, generate_enclave_key, encrypt_with_enclave, decrypt_with_enclave, delete_enclave_key, has_enclave_key
- **Base64 Encoding**: Commands use base64 for data transport between frontend and backend
- **Error Mapping**: LAErrorUserCancel (-128) -> user cancelled, LAErrorBiometryNotEnrolled (-7) -> Touch ID not set up
- **Platform Guard**: All Secure Enclave code wrapped in `#[cfg(target_os = "macos")]`, non-macOS returns NotAvailable or error

## Windows Credential Manager Storage

- **Location**: `draupnir-storage/src/windows.rs` - Windows-specific SecureStorage implementation
- **Crate**: Uses `keyring` crate v3 for cross-platform credential storage (Windows Credential Manager backend)
- **Target Name Format**: `Draupnir/{wallet_id}` - uses `Entry::new_with_target()` for custom target names
- **Credential Storage**: Binary data encoded as base64 since Windows Credential Manager stores string secrets
- **Service Name**: `com.draupnir.wallet` - consistent with macOS Keychain service name
- **User Name**: `draupnir` - fixed user name for all entries (target name provides uniqueness)
- **Error Mapping**: keyring::Error::NoEntry -> NotFound, NoStorageAccess -> AccessDenied, TooLong/Invalid -> InvalidKey
- **Delete Behavior**: Idempotent - returns Ok(()) even if credential doesn't exist
- **List Limitation**: keyring crate doesn't support enumeration; callers should use wallets.json for wallet list
- **Platform Guard**: Module wrapped in `#[cfg(target_os = "windows")]` to only compile on Windows
- **Base64 Implementation**: Custom base64 encode/decode functions to avoid extra dependency

## Linux libsecret Storage

- **Location**: `draupnir-storage/src/linux.rs` - Linux-specific SecureStorage implementation
- **Crate**: Uses `keyring` crate v3 with libsecret backend (GNOME Keyring / Secret Service API)
- **Service Name**: `com.draupnir.wallet` - consistent with macOS/Windows implementations
- **User Format**: Uses the wallet key directly as the "user" identifier in `Entry::new(service, key)`
- **Binary Data**: Unlike Windows, libsecret natively supports binary secrets via `set_secret(&[u8])`
- **No Base64**: Binary data stored directly without encoding (keyring v3 API difference)
- **Error Mapping**: keyring::Error::NoEntry -> NotFound, NoStorageAccess -> AccessDenied, TooLong/Invalid -> InvalidKey
- **Delete Behavior**: Idempotent - returns Ok(()) even if secret doesn't exist
- **List Limitation**: keyring crate doesn't support enumeration; callers should use wallets.json for wallet list
- **Platform Guard**: Module wrapped in `#[cfg(target_os = "linux")]` to only compile on Linux
- **Keyring API Difference**: Linux backend uses `&[u8]`/`Vec<u8>` for secrets, Windows uses strings (requires base64)

## Alchemy NFT API Module

- **Location**: `draupnir-evm/src/nft.rs` - Alchemy NFT API v3 integration for ERC-721/1155 discovery
- **API Endpoint**: RPC URL converted from `/v2/{key}` to `/nft/v3/{key}/getNFTsForOwner`
- **Pagination**: PAGE_SIZE = 100 NFTs per request, uses page_key for continuation
- **Max Limit**: fetch_all_nfts_for_owner() caps at 1000 NFTs by default to prevent memory issues
- **Token Types**: Detects ERC-721 vs ERC-1155 from token_type or contract.token_type field
- **Image Resolution**: Uses draupnir_chains::gateway::resolve_uri() for IPFS/Arweave URIs
- **Image Priority**: Prefers cached_url > png_url > thumbnail_url > original_url from Alchemy response
- **Metadata Fallbacks**: NFT name falls back to contract.name, then "#tokenId"; collection from collection.name, then OpenSea metadata
- **Attributes Parsing**: Extracts from raw.metadata.attributes array, handles string/int/float/bool values
- **Animation URL**: Parsed from raw.metadata.animation_url field
- **Alchemy Detection**: is_alchemy_endpoint() checks for .alchemy.com or .alchemyapi.io host
- **Non-Alchemy Providers**: Returns empty Vec gracefully (NFT API not available)
- **EvmProvider Changes**: Now stores rpc_url String field, added rpc_url() getter, with_provider() takes rpc_url param
- **Debug Security**: Debug impl redacts API key from RPC URL in output

## Helius DAS API Module (Solana NFTs)

- **Location**: `draupnir-solana/src/nft.rs` - Helius Digital Asset Standard API integration
- **API Method**: `getAssetsByOwner` JSON-RPC method for fetching NFTs by owner address
- **Pagination**: PAGE_SIZE = 100 NFTs per request, 1-indexed pages, max 1000 NFTs total
- **Request Params**: GetAssetsByOwnerParams with owner_address, page, limit, displayOptions (showCollectionMetadata)
- **NFT Interfaces**: V1_NFT, V1_PRINT, LEGACY_NFT, V2_NFT, ProgrammableNFT, PROGRAMMABLE_NFT, MplCoreAsset
- **Token Standards**: "Metaplex NFT" (V1/V2), "Programmable NFT" (pNFT), "MPL Core", "Compressed NFT"
- **Compression Detection**: compression.compressed field indicates cNFTs
- **Image Resolution**: Prefers links.image > files[cdn_uri] > files[uri with IPFS/Arweave resolution]
- **Animation URLs**: Checks links.animation_url or files with video/audio/model MIME types
- **Collection Info**: Extracted from grouping array where group_key == "collection"
- **Attributes**: metadata.attributes array with trait_type, value (string/number/bool), display_type
- **Helius Detection**: is_helius_endpoint() checks for .helius-rpc.com host
- **Non-Helius Providers**: Returns empty Vec gracefully (DAS API not available)
- **SolanaProvider Integration**: get_nfts() checks for Helius endpoint before calling NFT module

## Transaction History Module

- **Location**: `draupnir-core/src/transaction_history.rs` - local storage for wallet transaction history
- **TransactionRecord Struct**: chain_id, chain_type, tx_hash, from, to, value, asset_type, symbol, decimals, status, direction, timestamp, block_number, fee, fee_usd
- **TransactionDirection Enum**: Sent, Received - serializes as lowercase strings
- **AssetType Enum**: Native, Token { contract_address }, Nft { contract_address, token_id }
- **Limit**: MAX_TRANSACTIONS_PER_WALLET = 100, oldest removed when exceeded
- **Ordering**: Transactions stored newest first in Vec, sorted by timestamp descending on merge
- **Duplicate Detection**: Transactions skipped if tx_hash already exists (add_transaction and merge_transactions)
- **WalletHistory**: Per-wallet container with wallet_id and Vec<TransactionRecord>
- **TransactionHistoryData**: Persisted format with version field and Vec<WalletHistory>
- **TransactionFilter**: Filter by chain_id, direction, asset_type (Native/Token/Nft/TokenContract/NftContract), status, limit
- **Tauri Commands**: get_transaction_history, get_transaction, record_transaction, update_transaction_status, get_pending_transactions, clear_transaction_history
- **Persistence**: Saved to `transaction-history.json` via AppState.save_transaction_history()
- **AppState Integration**: transaction_history field as RwLock<TransactionHistory>, loaded in AppState::initialize()

## App Reset Functionality

- **Location**: `draupnir-app/src/commands.rs` - reset_app Tauri command
- **Confirmation Phrase**: Exact match required for "reset everything" (stored as RESET_CONFIRMATION_PHRASE constant)
- **Reset Sequence**: 1) Collect wallet IDs, 2) Lock all wallets, 3) Clear in-memory seeds, 4) Delete secure storage entries, 5) Delete all data files, 6) Clear in-memory state
- **Platform-Specific Storage Clearing**: Uses MacOSStorage/WindowsStorage/LinuxStorage via cfg attributes for Keychain/Credential Manager/libsecret
- **Secure Enclave Keys**: Also deletes any Secure Enclave keys on macOS during reset
- **FileStorage.delete_all()**: New method in `draupnir-storage/src/file.rs` that recursively deletes all files and subdirectories in storage
- **Frontend Component**: `ResetApp.svelte` modal with danger zone styling, confirmation input, and onreset callback
- **Dashboard Integration**: Danger Zone section in settings page with red styling, calls handleAppReset() which triggers App.svelte's handleAppReset() to return to welcome screen
- **Error Handling**: Logs warnings for failed secure storage deletions but continues (entries might not exist)

## Log Export Module

- **Location**: `draupnir-app/src/commands.rs` - log export and management Tauri commands
- **Tauri Commands**: export_logs, clear_logs, get_log_stats
- **ExportLogsResponse**: Struct with content (combined log text), filename (suggested name with timestamp), size_bytes, file_count
- **LogStats**: Struct with file_count, total_size_bytes, log_directory path
- **Sensitive Data Filtering**: Uses `logging::contains_sensitive_data()` to filter out lines with password, mnemonic, seed, private_key, etc.
- **Log File Pattern**: Matches files starting with "draupnir.log" or "security.log" in log directory
- **Sort Order**: Export combines files sorted by modification time, oldest first
- **Error Handling**: Gracefully handles nonexistent log directory (returns empty/zero)
- **Log Format**: JSON format via tracing-subscriber includes timestamp, level, target, message fields
- **Clear Behavior**: Deletes only log files, preserves other files in directory
- **Frontend Integration**: Backend returns log content; frontend creates blob and triggers download

## Settings Page Module (ui-011)

- **Location**: `frontend/src/lib/components/SettingsPage.svelte` - comprehensive settings UI
- **Sections**: General, Security, Networks, Wallets, Address Book, About, Logs, Danger Zone
- **General Settings**: Currency dropdown (USD/EUR/GBP/JPY/CNY), Theme toggle (dark/system)
- **Security Settings**: Auto-lock selector (1/5/15/30 min, never), Touch ID toggle (macOS only), Recovery phrase button
- **Network Settings**: Show testnets toggle
- **Wallet Management**: List all wallets with rename/remove buttons, create/import wallet buttons
- **Address Book**: Full CRUD for contacts with EVM/Solana chain type selection
- **Logs Section**: Export logs button (downloads as .txt file), Clear logs button, shows file count and size
- **Toggle Button Pattern**: Custom CSS toggle with `.toggle-btn.enabled` class, uses `role="switch"` and `aria-checked` for accessibility
- **Platform Detection**: Uses `navigator.platform.toLowerCase().includes('mac')` for Touch ID visibility
- **New Tauri Commands**: get_display_currency, set_display_currency, get_theme, set_theme, get_biometric_enabled, set_biometric_enabled, rename_wallet, remove_wallet
- **Currency Validation**: Backend validates currency is one of USD/EUR/GBP/JPY/CNY
- **Theme Validation**: Backend validates theme is one of "dark"/"system"
- **Wallet Removal Protection**: Backend prevents removing the last wallet with error message
- **Dashboard Integration**: SettingsPage receives activeWallet, wallets array, and callbacks for wallet changes and app reset

## NFT Detail View Component (ui-010)

- **Location**: `frontend/src/lib/components/NftDetail.svelte` - modal for viewing NFT details
- **Props**: nft (Nft), chain (ChainConfig), open (bindable), ontransfer (callback), onclose (callback)
- **Media Handling**: Supports images (PNG, JPG, GIF, SVG, WebP) and videos (MP4, WebM) via animation_url field
- **Video Detection**: Checks for .mp4, .webm extensions or 'video' in URL to render video element with controls
- **Attributes Display**: Grid of attribute tags showing trait_type and value from backend NftAttribute array
- **Explorer URLs**: EVM uses `/token/{contract}?a={tokenId}`, Solana uses `/address/{contract}?cluster={cluster}`
- **PortfolioOverview Integration**: Added handleNftClick() to open modal, onNftTransfer prop for send flow integration
- **Derived Function Pattern**: For nullable state access in Svelte 5 $derived, use closure `$derived(() => { const x = state; ... })` to avoid null access errors
- **Responsive Layout**: Side-by-side media/info on screens > 600px, stacked on mobile

## Custom Network Management (ui-012)

- **Location**: Backend commands in `draupnir-app/src/commands.rs`, frontend components in `frontend/src/lib/components/`
- **Backend Commands**: add_custom_chain, update_custom_chain, remove_custom_chain - registered in main.rs
- **RPC Validation**: Commands call `draupnir_chains::tls::validate_rpc_url()` to enforce HTTPS
- **RPC Testing**: Commands create provider instance (EvmProvider or SolanaProvider) to test connectivity before saving
- **ChainRegistry Integration**: ChainRegistry.add_custom() checks for duplicate IDs, update_custom() and remove_custom() prevent built-in chain modification
- **AddNetwork.svelte**: Modal with chain type selector (EVM/Solana), form validation for name/chainId/rpcUrl/symbol/explorerUrl, testnet checkbox
- **EditNetwork.svelte**: Modal for editing custom networks, displays read-only chain type and ID, includes delete button with confirmation
- **NetworkSelector Integration**: Added edit icon buttons on custom networks, Add Network button opens AddNetwork modal, callbacks for added/updated/deleted
- **Dashboard Integration**: handleNetworkAdded/Updated/Deleted reload chains via loadChains(), toast notifications for success
- **Form Validation**: Name max 50 chars, RPC URL must be HTTPS, chain ID numeric for EVM or alphanumeric lowercase for Solana, symbol max 10 chars
- **Error Handling**: RPC connection failures show user-friendly error messages, backend errors propagated to frontend via AppError

## Implementation Status (2026-01-18 Planning Session)

- **Task Count**: 79 total tasks (49 completed + 30 pending), 14 new tasks added from gap analysis
- **Completion Rate**: 62% of tasks completed, up from 52% last session
- **Backend Maturity**: ~95% complete - all 7 crates functional with 610+ passing tests
- **Frontend Maturity**: ~60% complete - core flows working, polish and edge cases pending
- **Test Coverage**: Strong unit test coverage (610+ tests), but missing integration tests
- **Critical Gaps Found**: CI/CD pipeline, integration tests, commands.rs modularity, cache integration, RwLock timeout handling

## Architecture Observations

- **commands.rs Size**: 5698 lines / 176KB - monolithic file needs refactoring (arch-002)
- **Unwrap Usage**: 786+ .unwrap() calls detected in non-test code - violates error handling spec (arch-003)
- **RwLock Pattern**: No timeout handling for state access - blocking acquisition could cause deadlocks (arch-004)
- **Cache Integration**: CacheManager infrastructure exists but not wired into chain providers (cache-002)
- **NFT Cache Unbounded**: No LRU eviction when cache exceeds 1GB limit (cache-003)
- **Single RPC**: Each chain has only one RPC endpoint, no fallback (chains-008)
- **Auto-Lock Timer**: Setting stored in config but timer logic not integrated (app-014)

## Quality Gates Gap

- **No CI/CD**: GitHub Actions workflow does not exist
- **No Integration Tests**: Only unit tests present; missing tests/ directory
- **No Clippy Config**: clippy.toml not found at project root
- **No Rustfmt Config**: rustfmt.toml not found at project root
- **Manual Enforcement**: All quality gates must be run manually by developers

## Multi-Chain Architecture Gaps

- **ViewMode Missing**: All|Evm|Solana view mode not implemented (chains-007)
- **Balance Aggregation**: No combined portfolio view across chains
- **Network Fallback**: No cached data display when RPC unavailable (ui-034)
- **Chain Reorg Detection**: No handling for EVM transaction reorganizations (chains-006)

## Security Implementation Status

- **Encryption**: AES-256-GCM + Argon2id fully implemented
- **Keychain**: macOS, Windows, Linux all implemented
- **Secure Enclave**: Infrastructure exists, Touch ID validation incomplete (security-008)
- **XSS Protection**: NFT metadata sanitization not implemented (security-009)
- **Clipboard Countdown**: Implemented via ClipboardToast.svelte with circular progress ring and global state
