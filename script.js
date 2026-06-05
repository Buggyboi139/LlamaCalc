const modelSelect = document.getElementById('modelSelect');
const quantSelect = document.getElementById('quantSelect');
const contextSlider = document.getElementById('contextSlider');
const contextDisplay = document.getElementById('contextDisplay');
const vramInput = document.getElementById('vramInput');
const ramInput = document.getElementById('ramInput');
const gpuCountInput = document.getElementById('gpuCountInput');
const cpuInput = document.getElementById('cpuInput');
const envSelect = document.getElementById('envSelect');
const modelPathInput = document.getElementById('modelPathInput');
const execPathInput = document.getElementById('execPathInput');
const jinjaInput = document.getElementById('jinjaInput');

const modeRadios = document.querySelectorAll('input[name="runMode"]');
const serverFlagsRow = document.getElementById('serverFlagsRow');
const hostInput = document.getElementById('hostInput');
const portInput = document.getElementById('portInput');
const npInput = document.getElementById('npInput');

const nommapCheck = document.getElementById('nommapCheck');
const mlockCheck = document.getElementById('mlockCheck');
const flashattnCheck = document.getElementById('flashattnCheck');
const noKvOffloadCheck = document.getElementById('noKvOffloadCheck');
const noPromptCacheCheck = document.getElementById('noPromptCacheCheck');
const contextShiftCheck = document.getElementById('contextShiftCheck');
const ncpumoeInput = document.getElementById('ncpumoeInput');
const threadsbatchInput = document.getElementById('threadsbatchInput');
const batchsizeInput = document.getElementById('batchsizeInput');

const threadPrioSelect = document.getElementById('threadPrioSelect');
const splitModeSelect = document.getElementById('splitModeSelect');
const splitModeGroup = document.getElementById('splitModeGroup');

const cacheTypeKSelect = document.getElementById('cacheTypeKSelect');
const cacheTypeVSelect = document.getElementById('cacheTypeVSelect');
const gpuBandwidthInput = document.getElementById('gpuBandwidthInput');
const ramBandwidthInput = document.getElementById('ramBandwidthInput');

const ropeSection = document.getElementById('ropeSection');
const ropeScalingSelect = document.getElementById('ropeScalingSelect');
const ropeFreqBaseInput = document.getElementById('ropeFreqBaseInput');
const ropeFreqScaleInput = document.getElementById('ropeFreqScaleInput');

const loraPathInput = document.getElementById('loraPathInput');
const loraScaleInput = document.getElementById('loraScaleInput');

const numaRow = document.getElementById('numaRow');
const numaCheck = document.getElementById('numaCheck');
const numaModeSelect = document.getElementById('numaModeSelect');

const reasoningToggleRow = document.getElementById('reasoningToggleRow');
const reasoningCheck = document.getElementById('reasoningCheck');

const samplingSection = document.getElementById('samplingSection');
const tempInput = document.getElementById('tempInput');
const topPInput = document.getElementById('topPInput');
const topKInput = document.getElementById('topKInput');
const minPInput = document.getElementById('minPInput');
const repeatPenaltyInput = document.getElementById('repeatPenaltyInput');
const mirostatSelect = document.getElementById('mirostatSelect');

const tpsDisplay = document.getElementById('tpsDisplay');
const prefillTpsDisplay = document.getElementById('prefillTpsDisplay');
const bandwidthDisplay = document.getElementById('bandwidthDisplay');
const totalMemDisplay = document.getElementById('totalMemDisplay');
const ramSpillDisplay = document.getElementById('ramSpillDisplay');
const moeRamBreakdown = document.getElementById('moeRamBreakdown');
const moeRamBreakdownValue = document.getElementById('moeRamBreakdownValue');
const offloadDisplay = document.getElementById('offloadDisplay');
const commandOutput = document.getElementById('commandOutput');
const copyBtn = document.getElementById('copyBtn');

const logBtn = document.getElementById('logBtn');
const logTable = document.getElementById('logTable');
const copyLogBtn = document.getElementById('copyLogBtn');
const resetBtn = document.getElementById('resetBtn');

const barOs = document.getElementById('barOs');
const barCtx = document.getElementById('barCtx');
const barModel = document.getElementById('barModel');
const lblOs = document.getElementById('lblOs');
const lblCtx = document.getElementById('lblCtx');
const lblModel = document.getElementById('lblModel');

let modelsData = [];
let quantCatalogData = [];

const OS_VRAM_OVERHEAD_GB = 1.5;
const OS_RAM_OVERHEAD_GB = 4.0;
const RAM_SAFETY_MARGIN_GB = 1.0;
const METADATA_OVERHEAD_GB = 0.15;
const NON_REPEATING_WEIGHT_RATIO = 0.05;
const CACHE_BYTES_BY_TYPE = { f16: 2, q8_0: 1, q4_0: 0.5 };
const STORAGE_KEY = 'llamacalc_v1';
const STORAGE_KEY_LOGS = 'llamacalc_logs_v1';

const CONTEXT_SIZES = [8000, 16000, 32000, 64000, 96000, 128000, 256000];

const fallbackQuantCatalog = [
    { id: "FP16",   display_name: "FP16",   fallback_bytes_per_param: 2,       recommended: false },
    { id: "Q8_0",   display_name: "Q8_0",   fallback_bytes_per_param: 1.0625, recommended: false },
    { id: "Q6_K",   display_name: "Q6_K",   fallback_bytes_per_param: 0.825,  recommended: true  },
    { id: "Q5_K_M", display_name: "Q5_K_M", fallback_bytes_per_param: 0.70625,recommended: true  },
    { id: "Q4_K_M", display_name: "Q4_K_M", fallback_bytes_per_param: 0.60625,recommended: true  },
    { id: "Q3_K_M", display_name: "Q3_K_M", fallback_bytes_per_param: 0.4625, recommended: false },
    { id: "Q2_K",   display_name: "Q2_K",   fallback_bytes_per_param: 0.3625, recommended: false }
];

let benchmarkLogs = [];
try { benchmarkLogs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS)) || []; } catch(e){}

function saveState() {
    try {
        const state = {
            modelIndex:    modelSelect.value,
            quant:         quantSelect.value,
            vram:          vramInput.value,
            ram:           ramInput.value,
            gpuCount:      gpuCountInput.value,
            cpu:           cpuInput.value,
            env:           envSelect.value,
            modelPath:     modelPathInput.value,
            execPath:      execPathInput.value,
            jinja:         jinjaInput.value,
            nommap:        nommapCheck.checked,
            mlock:         mlockCheck.checked,
            flashattn:     flashattnCheck.checked,
            noKvOffload:   noKvOffloadCheck.checked,
            noPromptCache: noPromptCacheCheck.checked,
            contextShift:  contextShiftCheck.checked,
            threadPrio:    threadPrioSelect.value,
            splitMode:     splitModeSelect.value,
            ncpumoe:       ncpumoeInput.value,
            threadsbatch:  threadsbatchInput.value,
            batchsize:     batchsizeInput.value,
            host:          hostInput.value,
            port:          portInput.value,
            np:            npInput.value,
            runMode:       document.querySelector('input[name="runMode"]:checked')?.value || 'cli',
            cacheTypeK:    cacheTypeKSelect.value,
            cacheTypeV:    cacheTypeVSelect.value,
            gpuBandwidth:  gpuBandwidthInput.value,
            ramBandwidth:  ramBandwidthInput.value,
            ropeScaling:   ropeScalingSelect.value,
            ropeFreqBase:  ropeFreqBaseInput.value,
            ropeFreqScale: ropeFreqScaleInput.value,
            loraPath:      loraPathInput.value,
            loraScale:     loraScaleInput.value,
            numa:          numaCheck.checked,
            numaMode:      numaModeSelect.value,
            reasoning:     reasoningCheck.checked,
            temp:          tempInput.value,
            topP:          topPInput.value,
            topK:          topKInput.value,
            minP:          minPInput.value,
            repeatPenalty: repeatPenaltyInput.value,
            mirostat:      mirostatSelect.value,
            contextSize:   contextIndexToSize(contextSlider.value),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);

        if (s.quant)                quantSelect.value = s.quant;
        if (s.vram !== undefined)   vramInput.value = s.vram;
        if (s.ram !== undefined)    ramInput.value = s.ram;
        if (s.gpuCount !== undefined) gpuCountInput.value = s.gpuCount;
        if (s.cpu !== undefined)    cpuInput.value = s.cpu;
        if (s.env)                  envSelect.value = s.env;
        if (s.modelPath !== undefined) modelPathInput.value = s.modelPath;
        if (s.execPath !== undefined)  execPathInput.value = s.execPath;
        if (s.jinja !== undefined)  jinjaInput.value = s.jinja;
        if (s.nommap !== undefined) nommapCheck.checked = s.nommap;
        if (s.mlock !== undefined)  mlockCheck.checked = s.mlock;
        if (s.flashattn !== undefined) flashattnCheck.checked = s.flashattn;
        if (s.noKvOffload !== undefined) noKvOffloadCheck.checked = s.noKvOffload;
        if (s.noPromptCache !== undefined) noPromptCacheCheck.checked = s.noPromptCache;
        if (s.contextShift !== undefined) contextShiftCheck.checked = s.contextShift;
        if (s.threadPrio)           threadPrioSelect.value = s.threadPrio;
        if (s.splitMode)            splitModeSelect.value = s.splitMode;
        if (s.ncpumoe !== undefined)   ncpumoeInput.value = s.ncpumoe;
        if (s.threadsbatch !== undefined) threadsbatchInput.value = s.threadsbatch;
        if (s.batchsize !== undefined)    batchsizeInput.value = s.batchsize;
        if (s.host !== undefined)   hostInput.value = s.host;
        if (s.port !== undefined)   portInput.value = s.port;
        if (s.np !== undefined)     npInput.value = s.np;
        if (s.runMode) {
            const radio = document.querySelector(`input[name="runMode"][value="${s.runMode}"]`);
            if (radio) radio.checked = true;
        }
        if (s.cacheTypeK)    cacheTypeKSelect.value = s.cacheTypeK;
        if (s.cacheTypeV)    cacheTypeVSelect.value = s.cacheTypeV;
        if (s.gpuBandwidth !== undefined) gpuBandwidthInput.value = s.gpuBandwidth;
        if (s.ramBandwidth !== undefined) ramBandwidthInput.value = s.ramBandwidth;
        if (s.ropeScaling)   ropeScalingSelect.value = s.ropeScaling;
        if (s.ropeFreqBase !== undefined)  ropeFreqBaseInput.value = s.ropeFreqBase;
        if (s.ropeFreqScale !== undefined) ropeFreqScaleInput.value = s.ropeFreqScale;
        if (s.loraPath !== undefined)  loraPathInput.value = s.loraPath;
        if (s.loraScale !== undefined) loraScaleInput.value = s.loraScale;
        if (s.numa !== undefined)  numaCheck.checked = s.numa;
        if (s.numaMode)            numaModeSelect.value = s.numaMode;
        if (s.reasoning !== undefined) reasoningCheck.checked = s.reasoning;
        if (s.temp !== undefined)          tempInput.value = s.temp;
        if (s.topP !== undefined)          topPInput.value = s.topP;
        if (s.topK !== undefined)          topKInput.value = s.topK;
        if (s.minP !== undefined)          minPInput.value = s.minP;
        if (s.repeatPenalty !== undefined) repeatPenaltyInput.value = s.repeatPenalty;
        if (s.mirostat !== undefined)      mirostatSelect.value = s.mirostat;
        if (s.contextSize !== undefined) {
            const idx = contextSizeToIndex(s.contextSize);
            contextSlider.value = idx;
            contextDisplay.textContent = contextIndexToSize(idx);
        }
        return s.modelIndex ?? null;
    } catch (e) {
        return null;
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'app-toast app-toast--visible app-toast--success';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('app-toast--visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function readPositiveNumber(input, fallback = 0) {
    const parsed = Number.parseFloat(input.value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readNonNegativeNumber(input, fallback = 0) {
    const parsed = Number.parseFloat(input.value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function getQuantRecord(quantId) {
    return quantCatalogData.find(q => q.id === quantId)
        || fallbackQuantCatalog.find(q => q.id === quantId);
}

function contextIndexToSize(index) {
    return CONTEXT_SIZES[clamp(parseInt(index, 10), 0, CONTEXT_SIZES.length - 1)] || 16000;
}

function contextSizeToIndex(size) {
    const idx = CONTEXT_SIZES.indexOf(parseInt(size, 10));
    return idx >= 0 ? idx : 1;
}

function escapeHtml(str) {
    const AMP  = String.fromCharCode(38) + 'amp;';
    const LT   = String.fromCharCode(38) + 'lt;';
    const GT   = String.fromCharCode(38) + 'gt;';
    const QUOT = String.fromCharCode(38) + 'quot;';
    return String(str)
        .replace(/&/g, AMP)
        .replace(/</g, LT)
        .replace(/>/g, GT)
        .replace(/"/g, QUOT);
}

function renderCommandParts(parts) {
    return parts.map(part => {
        const escaped = escapeHtml(part.text);
        if (part.warning) {
            return `<span class="cmd-invalid" data-tooltip="${escapeHtml(part.warning)}">${escaped}</span>`;
        }
        return escaped;
    }).join(' ');
}

function estimateModelWeightGB(model, quant) {
    if (model.quant_sizes_gb && Number.isFinite(model.quant_sizes_gb[quant.id])) {
        return model.quant_sizes_gb[quant.id];
    }
    const parametersB = model.parameters_b || model.parameters || 0;
    return parametersB * quant.fallback_bytes_per_param;
}

function estimateKVCacheGB(model, contextTokens, parallelSlots, cacheTypeK = "f16", cacheTypeV = "f16") {
    const layers        = model.layers || 32;
    const hiddenSize    = model.hidden_size || 4096;
    const attentionHeads = model.attention_heads || 32;
    const kvHeads       = model.kv_heads || attentionHeads;
    const headDim       = hiddenSize / attentionHeads;
    const bytesPerK     = CACHE_BYTES_BY_TYPE[cacheTypeK] || CACHE_BYTES_BY_TYPE.f16;
    const bytesPerV     = CACHE_BYTES_BY_TYPE[cacheTypeV] || CACHE_BYTES_BY_TYPE.f16;
    const kvBytes = layers * contextTokens * parallelSlots * kvHeads * headDim * (bytesPerK + bytesPerV);
    return kvBytes / (1024 ** 3);
}

function estimateComputeBufferGB(modelWeightGB) {
    return Math.max(0.25, modelWeightGB * 0.03);
}

function getAvailableVramGB(env, totalVram) {
    return env === "gpu" ? Math.max(0, totalVram - OS_VRAM_OVERHEAD_GB) : 0;
}

function getAvailableRamGB(ramTotal) {
    return Math.max(0, ramTotal - OS_RAM_OVERHEAD_GB - RAM_SAFETY_MARGIN_GB);
}

function estimateGpuBandwidthGBps(vramPerGpu) {
    const override = Number.parseFloat(gpuBandwidthInput.value);
    if (Number.isFinite(override) && override > 0) return override;
    if (vramPerGpu >= 24) return 600;
    if (vramPerGpu >= 16) return 448;
    if (vramPerGpu >= 12) return 336;
    if (vramPerGpu > 0)   return 224;
    return 0;
}

function estimateRamBandwidthGBps(physicalCores) {
    const override = Number.parseFloat(ramBandwidthInput.value);
    if (Number.isFinite(override) && override > 0) return override;
    if (physicalCores >= 16) return 100;
    if (physicalCores >= 12) return 80;
    if (physicalCores >= 8)  return 60;
    return 45;
}

function estimateDecodeWeightGB(model, modelWeightGB) {
    if (model.architecture !== "moe") return modelWeightGB;
    const activeParameters = model.active_parameters_b || model.parameters_b || model.parameters || 1;
    const totalParameters  = model.parameters_b || model.parameters || activeParameters;
    const moeOverheadFactor = 1.25;
    return Math.max(
        modelWeightGB * (activeParameters / totalParameters) * moeOverheadFactor,
        modelWeightGB * 0.1
    );
}

function estimateMoeExpertRamGB(model, modelWeightGB, ncpumoe) {
    if (model.architecture !== "moe" || ncpumoe <= 0) return 0;
    const layers   = model.layers || 32;
    const clampedN = Math.min(ncpumoe, layers);
    const activeB  = model.active_parameters_b || model.parameters_b || 1;
    const totalB   = model.parameters_b || activeB;
    const numExperts   = model.experts || 1;
    const activeExperts = model.active_experts || 1;

    let expertFractionOfWeight;
    if (numExperts > 1 && activeExperts < numExperts) {
        const ratio  = activeExperts / numExperts;
        const sharedB = (activeB - ratio * totalB) / (1 - ratio);
        expertFractionOfWeight = Math.max(0, Math.min(1, (totalB - sharedB) / totalB));
    } else {
        expertFractionOfWeight = Math.max(0, 1 - activeB / totalB);
    }
    return modelWeightGB * expertFractionOfWeight * (clampedN / layers);
}

function estimatePerformance({ mode, model, modelWeightGB, kvCacheGB, nglDisplay, physicalCores, vramPerGpu, gpuCount, disableKvOffload }) {
    const decodeWeightGB = Math.max(estimateDecodeWeightGB(model, modelWeightGB), 0.01);
    const kvVramGB = disableKvOffload ? 0 : kvCacheGB;
    const kvRamGB  = disableKvOffload ? kvCacheGB : 0;
    const layers = model.layers || 32;
    const gpuBandwidthPerGpu = estimateGpuBandwidthGBps(vramPerGpu);
    const effectiveGpuBandwidth = gpuBandwidthPerGpu * (gpuCount || 1);
    const ramBandwidth  = estimateRamBandwidthGBps(physicalCores);
    const gpuEfficiency = 0.55;
    const cpuEfficiency = 0.35;
    const coreFactor    = Math.min(1, physicalCores / 8);

    let fullGpuTps = 0;
    if (effectiveGpuBandwidth > 0) {
        const gpuTime = decodeWeightGB / (effectiveGpuBandwidth * gpuEfficiency);
        const cpuTime = kvRamGB / (ramBandwidth * cpuEfficiency * coreFactor);
        fullGpuTps = 1 / (gpuTime + cpuTime);
    }
    const cpuTps = (ramBandwidth * cpuEfficiency * coreFactor) / (decodeWeightGB + kvCacheGB);

    if (mode === "full_gpu") {
        return { selectedTps: fullGpuTps, fullGpuTps, cpuTps, hybridTps: 0, prefillTps: fullGpuTps * 8 };
    }

    if (mode === "hybrid" && nglDisplay > 0 && layers > 0 && effectiveGpuBandwidth > 0) {
        const gpuFraction = clamp(nglDisplay / layers, 0, 1);
        const cpuFraction = 1 - gpuFraction;
        const gpuTime = (decodeWeightGB * gpuFraction + kvVramGB) / (effectiveGpuBandwidth * gpuEfficiency);
        const cpuTime = (decodeWeightGB * cpuFraction + kvRamGB) / (ramBandwidth * cpuEfficiency * coreFactor);
        const syncPenalty = 1 + 0.25 + 0.10;
        const hybridTps = Math.min(1 / ((gpuTime + cpuTime) * syncPenalty), fullGpuTps);
        return { selectedTps: hybridTps, fullGpuTps, cpuTps, hybridTps, prefillTps: hybridTps * 5 };
    }

    return { selectedTps: cpuTps, fullGpuTps, cpuTps, hybridTps: 0, prefillTps: cpuTps * 3 };
}

function estimateOffload({ env, model, modelWeightGB, kvCacheGB, computeBufferGB, availableVram, availableRam, moeExpertRamGB, disableKvOffload }) {
    const layers   = model.layers || 32;
    const moeRamGB = moeExpertRamGB || 0;
    const effectiveVramWeightGB = Math.max(0, modelWeightGB - moeRamGB);
    const nonRepeatingWeightGB  = effectiveVramWeightGB * NON_REPEATING_WEIGHT_RATIO;
    const repeatingWeightGB     = effectiveVramWeightGB - nonRepeatingWeightGB;
    const totalRuntimeMemoryGB  = modelWeightGB + kvCacheGB + computeBufferGB + METADATA_OVERHEAD_GB;
    const totalAvailableMemoryGB = availableVram + availableRam;

    const kvVramGB = disableKvOffload ? 0 : kvCacheGB;
    const kvRamGB  = disableKvOffload ? kvCacheGB : 0;

    if (totalRuntimeMemoryGB > totalAvailableMemoryGB) {
        return { mode: "oom", nglCommand: null, nglDisplay: 0,
            vramUsedGB: Math.min(totalRuntimeMemoryGB, availableVram),
            ramUsedGB:  Math.max(0, totalRuntimeMemoryGB - availableVram),
            totalRuntimeMemoryGB };
    }

    if (env === "cpu" || availableVram <= 0) {
        return { mode: "cpu", nglCommand: null, nglDisplay: 0,
            vramUsedGB: 0, ramUsedGB: totalRuntimeMemoryGB, totalRuntimeMemoryGB };
    }

    if (effectiveVramWeightGB + kvVramGB + computeBufferGB + METADATA_OVERHEAD_GB <= availableVram) {
        return { mode: "full_gpu", nglCommand: 999, nglDisplay: layers,
            vramUsedGB: totalRuntimeMemoryGB - moeRamGB - kvRamGB,
            ramUsedGB:  moeRamGB + kvRamGB,
            totalRuntimeMemoryGB };
    }

    if (kvVramGB + computeBufferGB + METADATA_OVERHEAD_GB < availableVram) {
        const vramForWeightsGB   = availableVram - kvVramGB - computeBufferGB - METADATA_OVERHEAD_GB - nonRepeatingWeightGB;
        const weightGBPerLayer   = repeatingWeightGB / layers;
        const nglDisplay         = clamp(Math.floor(vramForWeightsGB / weightGBPerLayer), 0, layers);
        const gpuRepeatingWeightGB = weightGBPerLayer * nglDisplay;
        const gpuWeightGB        = nglDisplay > 0 ? nonRepeatingWeightGB + gpuRepeatingWeightGB : 0;
        const vramUsedGB         = kvVramGB + computeBufferGB + METADATA_OVERHEAD_GB + gpuWeightGB;
        return {
            mode:       nglDisplay > 0 ? "hybrid" : "cpu",
            nglCommand: nglDisplay > 0 ? nglDisplay : null,
            nglDisplay,
            vramUsedGB: nglDisplay > 0 ? vramUsedGB : 0,
            ramUsedGB:  nglDisplay > 0 ? Math.max(0, totalRuntimeMemoryGB - vramUsedGB) : totalRuntimeMemoryGB,
            totalRuntimeMemoryGB
        };
    }

    return { mode: "cpu", nglCommand: null, nglDisplay: 0,
        vramUsedGB: 0, ramUsedGB: totalRuntimeMemoryGB, totalRuntimeMemoryGB };
}

function shellQuote(value) {
    return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function getOffloadPresentation(mode, nglDisplay, warnings) {
    if (mode === "oom") return { text: "CRITICAL: Out of Memory (OOM)", color: "#ef4444" };
    if (mode === "cpu") {
        return {
            text: warnings.includes("Hybrid offload estimated slower than CPU-only; CPU mode recommended.")
                ? "CPU Recommended (Hybrid Slower)"
                : "CPU / System RAM Only",
            color: "#94a3b8"
        };
    }
    if (mode === "hybrid") return { text: `Partial Offload (${nglDisplay} layers) - Slower`, color: "#f59e0b" };
    return { text: "Full GPU Offload (Optimal)", color: "#34d399" };
}

function buildCommand({ mode, nglCommand, contextSize, physicalCores, logicalThreads, runMode, parallelSlots, selectedModel, availableRam, modelWeightGB, kvCacheGB, computeBufferGB, gpuCount }) {
    const parts = [];
    function add(text, warning = null) { parts.push({ text, warning }); }

    const modelPath      = modelPathInput.value.trim() || 'model.gguf';
    const execPath       = execPathInput.value.trim() || (runMode === 'server' ? `./llama.cpp/build/bin/llama-server` : `./llama.cpp/build/bin/llama-cli`);
    const decodeThreads  = clamp(physicalCores, 1, logicalThreads);
    const batchThreadsVal = Number.parseInt(threadsbatchInput.value, 10);
    const batchThreads   = Number.isFinite(batchThreadsVal) ? clamp(batchThreadsVal, 0, logicalThreads) : 0;
    const batchSize      = Number.parseInt(batchsizeInput.value, 10) || 0;

    add(execPath);
    add(`-m ${shellQuote(modelPath)}`);

    const ctxWarning = (selectedModel.max_context && contextSize > selectedModel.max_context)
        ? `Context size ${contextSize} exceeds the known model maximum of ${selectedModel.max_context} tokens. Output quality may degrade significantly.`
        : null;
    add(`-c ${contextSize}`, ctxWarning);

    add(`-t ${decodeThreads}`);

    if (runMode === 'server') {
        const host    = hostInput.value.trim() || '0.0.0.0';
        const portRaw = Number.parseInt(portInput.value, 10);
        const port    = Number.isFinite(portRaw) ? portRaw : 8080;
        add(`--host ${shellQuote(host)}`);
        add(`--port ${port}`);
        add(`-np ${parallelSlots}`);
    }

    if (mode !== "cpu" && mode !== "oom" && nglCommand > 0) {
        add(`-ngl ${nglCommand}`);
    }

    if (gpuCount > 1 && mode !== "cpu" && mode !== "oom") {
        add(`--tensor-split ${Array(gpuCount).fill('1').join(',')}`);
        if (splitModeSelect.value !== 'layer') {
            add(`-sm ${splitModeSelect.value}`);
        }
    }

    if (flashattnCheck.checked && selectedModel.supports_flash_attention !== false) {
        add(`--flash-attn on`);
    }

    if (noKvOffloadCheck.checked) {
        add(`-nkvo`);
    }

    if (noPromptCacheCheck.checked) {
        add(`--no-cache-prompt`);
    }

    if (contextShiftCheck.checked) {
        add(`--context-shift`);
    }

    const cacheTypeK = cacheTypeKSelect.value;
    const cacheTypeV = cacheTypeVSelect.value;
    if (cacheTypeK !== 'f16') add(`--cache-type-k ${cacheTypeK}`);
    if (cacheTypeV !== 'f16') add(`--cache-type-v ${cacheTypeV}`);

    if (nommapCheck.checked) {
        const nomapWarning = modelWeightGB > availableRam
            ? `--no-mmap: model weights (${modelWeightGB.toFixed(1)} GB) exceed available system RAM (${availableRam.toFixed(1)} GB). This flag will be ignored or cause errors at runtime.`
            : null;
        add(`--no-mmap`, nomapWarning);
    }

    if (mlockCheck.checked) {
        const totalRuntime = modelWeightGB + kvCacheGB + computeBufferGB + METADATA_OVERHEAD_GB;
        const mlockWarning = totalRuntime > availableRam
            ? `--mlock: total runtime memory (${totalRuntime.toFixed(1)} GB) exceeds available system RAM (${availableRam.toFixed(1)} GB). The OS may be unable to honor this memory lock.`
            : null;
        add(`--mlock`, mlockWarning);
    }

    const jinjaVal = jinjaInput.value.trim();
    if (jinjaVal) add(`--chat-template ${shellQuote(jinjaVal)}`);

    const ncpumoe = Number.parseInt(ncpumoeInput.value, 10);
    if (ncpumoe > 0) {
        if (selectedModel.architecture === "moe") {
            const modelLayers    = selectedModel.layers || 32;
            const clampedNcpumoe = Math.min(ncpumoe, modelLayers);
            let ncpuWarning = null;
            if (ncpumoe > modelLayers) {
                ncpuWarning = `--n-cpu-moe ${ncpumoe} exceeds the model's layer count (${modelLayers}). Value has been clamped to ${modelLayers}.`;
            } else if (mode === "full_gpu") {
                ncpuWarning = `--n-cpu-moe is set but the model fits fully in VRAM. This forces expert weights across the PCIe bus on every token and will degrade performance.`;
            }
            add(`--n-cpu-moe ${clampedNcpumoe}`, ncpuWarning);
        } else {
            add(`--n-cpu-moe ${ncpumoe}`, `--n-cpu-moe is only valid for Mixture-of-Experts (MoE) models. The selected model uses a dense architecture; this flag will be ignored by llama.cpp.`);
        }
    }

    const ropeScaling = ropeScalingSelect.value;
    if (ropeScaling !== 'none') {
        add(`--rope-scaling ${ropeScaling}`);
        const ropeFreqBase  = Number.parseFloat(ropeFreqBaseInput.value);
        const ropeFreqScale = Number.parseFloat(ropeFreqScaleInput.value);
        if (Number.isFinite(ropeFreqBase) && ropeFreqBase > 0) add(`--rope-freq-base ${ropeFreqBase}`);
        if (Number.isFinite(ropeFreqScale) && ropeFreqScale > 0 && ropeFreqScale !== 1) add(`--rope-freq-scale ${ropeFreqScale}`);
    }

    const loraPath = loraPathInput.value.trim();
    if (loraPath) {
        add(`--lora ${shellQuote(loraPath)}`);
        const loraScale = Number.parseFloat(loraScaleInput.value);
        if (Number.isFinite(loraScale) && loraScale !== 1.0) add(`--lora-scale ${loraScale}`);
    }

    if (numaCheck.checked) {
        add(`--numa ${numaModeSelect.value}`);
    }

    if (threadPrioSelect.value !== "0") {
        add(`--prio ${threadPrioSelect.value}`);
    }

    if (batchThreads > 0) {
        const tbWarning = (Number.isFinite(batchThreadsVal) && batchThreadsVal > logicalThreads)
            ? `-tb value ${batchThreadsVal} exceeds the inferred logical thread count (${logicalThreads}). The value has been clamped to ${logicalThreads}.`
            : null;
        add(`-tb ${batchThreads}`, tbWarning);
    }
    if (batchSize > 0 && batchSize !== 512) add(`-b ${batchSize}`);

    if (runMode === 'cli') {
        if (selectedModel.is_thinking_model && reasoningCheck.checked) {
            add(`--reasoning off`);
        }
        
        const temp          = Number.parseFloat(tempInput.value);
        const topP          = Number.parseFloat(topPInput.value);
        const topK          = Number.parseInt(topKInput.value, 10);
        const minP          = Number.parseFloat(minPInput.value);
        const repeatPenalty = Number.parseFloat(repeatPenaltyInput.value);
        const mirostat      = Number.parseInt(mirostatSelect.value, 10);

        if (Number.isFinite(temp)          && Math.abs(temp - 0.8) > 0.001)         add(`--temp ${temp}`);
        if (Number.isFinite(topP)          && Math.abs(topP - 0.95) > 0.001)        add(`--top-p ${topP}`);
        if (Number.isFinite(topK)          && topK !== 40)                          add(`--top-k ${topK}`);
        if (Number.isFinite(minP)          && Math.abs(minP - 0.05) > 0.001)        add(`--min-p ${minP}`);
        if (Number.isFinite(repeatPenalty) && Math.abs(repeatPenalty - 1.1) > 0.001) add(`--repeat-penalty ${repeatPenalty}`);
        if (mirostat > 0) add(`--mirostat ${mirostat}`);
    }

    return parts;
}

function calculateMetrics() {
    if (!modelsData.length) return;

    const selectedModel = modelsData[modelSelect.value];
    const quant = getQuantRecord(quantSelect.value);
    if (!selectedModel || !quant) return;

    const contextSize   = contextIndexToSize(contextSlider.value);
    const vramPerGpu    = readNonNegativeNumber(vramInput, 0);
    const gpuCount      = Math.max(1, Number.parseInt(gpuCountInput.value, 10) || 1);
    const totalVram     = vramPerGpu * gpuCount;
    const ramTotal      = readPositiveNumber(ramInput, 1);
    const physicalCores = Math.max(1, Number.parseInt(cpuInput.value, 10) || 4);
    const logicalThreads = Math.max(physicalCores, physicalCores * 2);
    const env           = envSelect.value;
    const runMode       = document.querySelector('input[name="runMode"]:checked').value;
    const parallelSlots = runMode === 'server' ? Math.max(1, Number.parseInt(npInput.value, 10) || 1) : 1;
    const cacheTypeK    = cacheTypeKSelect.value;
    const cacheTypeV    = cacheTypeVSelect.value;
    const warnings      = [];

    serverFlagsRow.style.display  = runMode === 'server' ? 'flex' : 'none';
    samplingSection.style.display = runMode === 'cli'    ? 'block' : 'none';
    numaRow.style.display         = physicalCores >= 16  ? 'flex' : 'none';

    if (gpuCount > 1) {
        splitModeGroup.style.display = 'flex';
    } else {
        splitModeGroup.style.display = 'none';
        splitModeSelect.value = 'layer';
    }

    if (selectedModel.is_thinking_model) {
        reasoningToggleRow.style.display = 'flex';
    } else {
        reasoningToggleRow.style.display = 'none';
        reasoningCheck.checked = false;
    }

    const modelWeightGB   = estimateModelWeightGB(selectedModel, quant);
    const kvCacheGB       = estimateKVCacheGB(selectedModel, contextSize, parallelSlots, cacheTypeK, cacheTypeV);
    const computeBufferGB = estimateComputeBufferGB(modelWeightGB);
    const availableVram   = getAvailableVramGB(env, totalVram);
    const availableRam    = getAvailableRamGB(ramTotal);

    ropeSection.style.display = contextSize > (selectedModel.default_context || 8192) ? 'block' : 'none';

    const ncpumoeRaw   = Number.parseInt(ncpumoeInput.value, 10);
    const ncpumoeValue = Number.isFinite(ncpumoeRaw) && ncpumoeRaw > 0 ? ncpumoeRaw : 0;
    const moeExpertRamGB = estimateMoeExpertRamGB(selectedModel, modelWeightGB, ncpumoeValue);

    let offload = estimateOffload({
        env, model: selectedModel, modelWeightGB, kvCacheGB,
        computeBufferGB, availableVram, availableRam, moeExpertRamGB, disableKvOffload: noKvOffloadCheck.checked
    });

    let performance = estimatePerformance({
        mode: offload.mode, model: selectedModel, modelWeightGB, kvCacheGB,
        nglDisplay: offload.nglDisplay, physicalCores, vramPerGpu, gpuCount, disableKvOffload: noKvOffloadCheck.checked
    });

    if (offload.mode === "hybrid" && performance.hybridTps < performance.cpuTps) {
        warnings.push("Hybrid offload estimated slower than CPU-only; CPU mode recommended.");
        offload = { ...offload, mode: "cpu", nglCommand: null, nglDisplay: 0,
            vramUsedGB: 0, ramUsedGB: offload.totalRuntimeMemoryGB };
        performance = estimatePerformance({
            mode: "cpu", model: selectedModel, modelWeightGB, kvCacheGB,
            nglDisplay: 0, physicalCores, vramPerGpu, gpuCount, disableKvOffload: noKvOffloadCheck.checked
        });
    }

    const presentation = getOffloadPresentation(offload.mode, offload.nglDisplay, warnings);

    if (offload.mode === "oom") {
        tpsDisplay.textContent = "Fail";
        tpsDisplay.style.color = "#ef4444";
        prefillTpsDisplay.textContent = "—";
        prefillTpsDisplay.style.color = "#94a3b8";
    } else {
        tpsDisplay.textContent = `~${performance.selectedTps.toFixed(1)} t/s`;
        tpsDisplay.style.color = presentation.color;
        prefillTpsDisplay.textContent = `~${performance.prefillTps.toFixed(0)} t/s`;
        prefillTpsDisplay.style.color = presentation.color;
    }

    const gpuBW = estimateGpuBandwidthGBps(vramPerGpu);
    const ramBW = estimateRamBandwidthGBps(physicalCores);
    if (env === 'gpu' && vramPerGpu > 0) {
        const effectiveBW = gpuBW * gpuCount;
        bandwidthDisplay.textContent = gpuCount > 1
            ? `GPU: ~${effectiveBW} GB/s (${gpuCount}×${gpuBW}) | RAM: ~${ramBW} GB/s`
            : `GPU: ~${gpuBW} GB/s | RAM: ~${ramBW} GB/s`;
    } else {
        bandwidthDisplay.textContent = `RAM: ~${ramBW} GB/s`;
    }

    totalMemDisplay.textContent = offload.totalRuntimeMemoryGB.toFixed(2) + " GB";
    ramSpillDisplay.textContent = offload.ramUsedGB.toFixed(2) + " GB";

    if (moeExpertRamGB > 0 && offload.ramUsedGB > 0) {
        moeRamBreakdown.style.display = 'flex';
        moeRamBreakdownValue.textContent = moeExpertRamGB.toFixed(2) + ' GB';
    } else {
        moeRamBreakdown.style.display = 'none';
    }

    offloadDisplay.textContent = presentation.text;
    offloadDisplay.style.color = presentation.color;
    offloadDisplay.title = warnings.join("\n");

    const visualKvCacheGB = noKvOffloadCheck.checked ? 0 : kvCacheGB;
    lblOs.textContent    = env === "gpu" ? OS_VRAM_OVERHEAD_GB : "0";
    lblCtx.textContent   = visualKvCacheGB.toFixed(1);
    lblModel.textContent = modelWeightGB.toFixed(1);

    if (totalVram > 0 && env === "gpu") {
        const pctOs    = (OS_VRAM_OVERHEAD_GB / totalVram) * 100;
        const pctCtx   = (visualKvCacheGB / totalVram) * 100;
        const pctModel = (modelWeightGB / totalVram) * 100;
        barOs.style.width    = `${Math.min(pctOs, 100)}%`;
        barCtx.style.width   = `${Math.min(pctCtx, 100 - pctOs)}%`;
        barModel.style.width = `${Math.min(pctModel, Math.max(0, 100 - pctOs - pctCtx))}%`;
        barModel.style.background = (pctOs + pctCtx + pctModel) > 100 ? "#ef4444" : "#34d399";
    } else {
        barOs.style.width = "0%"; barCtx.style.width = "0%"; barModel.style.width = "0%";
    }

    const parts = buildCommand({
        mode: offload.mode, nglCommand: offload.nglCommand, contextSize,
        physicalCores, logicalThreads, runMode, parallelSlots, selectedModel,
        availableRam, modelWeightGB, kvCacheGB, computeBufferGB, gpuCount
    });
    commandOutput.innerHTML = renderCommandParts(parts);

    saveState();
}

function handleModelChange() {
    if (!modelsData.length) return;
    const selectedModel = modelsData[modelSelect.value];
    jinjaInput.value = selectedModel.template || "chatml";

    const supportsFA = selectedModel.supports_flash_attention !== false;
    flashattnCheck.disabled = !supportsFA;
    const faLabel = document.querySelector('label[for="flashattnCheck"]');
    if (faLabel) {
        faLabel.style.opacity = supportsFA ? '1' : '0.4';
    }

    calculateMetrics();
}

function renderLogs() {
    logTable.innerHTML = benchmarkLogs.map((l, index) => `
        <tr style="border-bottom: 1px solid var(--border-glass);">
            <td style="padding: 10px;">${escapeHtml(l.model)}</td>
            <td style="padding: 10px;">${escapeHtml(l.context)}</td>
            <td style="padding: 10px;">
                <input type="text" class="editable-table-input" data-index="${index}" data-field="promptTs" value="${escapeHtml(l.promptTs)}">
            </td>
            <td style="padding: 10px;">
                <input type="text" class="editable-table-input" data-index="${index}" data-field="genTs" value="${escapeHtml(l.genTs)}">
            </td>
            <td style="padding: 10px; font-family: monospace; font-size: 0.8rem; word-break: break-all;">${escapeHtml(l.command)}</td>
            <td style="padding: 10px;">
                <button class="copy-button delete-log-btn" data-index="${index}" style="background: #ef4444; color: #fff; border: none;">Delete</button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.editable-table-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = e.target.getAttribute('data-index');
            const field = e.target.getAttribute('data-field');
            benchmarkLogs[idx][field] = e.target.value.trim();
            localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(benchmarkLogs));
        });
    });

    document.querySelectorAll('.delete-log-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            benchmarkLogs.splice(idx, 1);
            localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(benchmarkLogs));
            renderLogs();
        });
    });
}

function init() {
    Promise.all([
        fetch('models.json').then(res => res.json()),
        fetch('quants.json').then(res => res.json()).catch(() => fallbackQuantCatalog)
    ])
    .then(([models, quants]) => {
        modelsData = models;
        quantCatalogData = quants.length ? quants : fallbackQuantCatalog;

        modelsData.forEach((m, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = m.name + (m.architecture === 'moe' ? ' [MoE]' : '');
            modelSelect.appendChild(opt);
        });

        quantSelect.innerHTML = '';
        quantCatalogData.forEach(q => {
            const opt = document.createElement('option');
            opt.value = q.id;
            opt.textContent = q.recommended ? `${q.display_name} ★` : q.display_name;
            if (q.id === 'Q4_K_M') opt.selected = true;
            quantSelect.appendChild(opt);
        });

        const savedModelIndex = loadState();
        if (savedModelIndex !== null && savedModelIndex !== undefined && modelsData[savedModelIndex]) {
            modelSelect.value = savedModelIndex;
        }

        handleModelChange();
        renderLogs();
    })
    .catch(err => {
        commandOutput.textContent = "Error loading model or quant catalog.";
    });
}

const allInputs = [
    modelSelect, quantSelect, vramInput, ramInput, gpuCountInput, cpuInput, envSelect,
    modelPathInput, execPathInput, jinjaInput, nommapCheck, mlockCheck, flashattnCheck,
    noKvOffloadCheck, noPromptCacheCheck, contextShiftCheck,
    ncpumoeInput, threadsbatchInput, batchsizeInput, hostInput, portInput, npInput,
    threadPrioSelect, splitModeSelect,
    cacheTypeKSelect, cacheTypeVSelect, gpuBandwidthInput, ramBandwidthInput,
    ropeScalingSelect, ropeFreqBaseInput, ropeFreqScaleInput,
    loraPathInput, loraScaleInput, numaCheck, numaModeSelect,
    tempInput, topPInput, topKInput, minPInput, repeatPenaltyInput, mirostatSelect,
    reasoningCheck
];

allInputs.forEach(input => {
    input.addEventListener('change', calculateMetrics);
    if (input.type !== 'checkbox' && input.type !== 'radio') {
        input.addEventListener('input', calculateMetrics);
    }
});

modeRadios.forEach(radio => radio.addEventListener('change', (e) => {
    const currentVal = execPathInput.value.trim();
    if (e.target.value === 'server' && (currentVal === './llama.cpp/build/bin/llama-cli' || currentVal === '')) {
        execPathInput.value = './llama.cpp/build/bin/llama-server';
    } else if (e.target.value === 'cli' && (currentVal === './llama.cpp/build/bin/llama-server' || currentVal === '')) {
        execPathInput.value = './llama.cpp/build/bin/llama-cli';
    }
    calculateMetrics();
}));
modelSelect.addEventListener('change', handleModelChange);

contextSlider.addEventListener('input', (e) => {
    contextDisplay.textContent = contextIndexToSize(e.target.value);
    calculateMetrics();
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(commandOutput.textContent).then(() => {
        showToast("Command copied to clipboard!");
    });
});

logBtn.addEventListener('click', () => {
    const selectedModel = modelsData[modelSelect.value];
    if(!selectedModel) return;
    
    benchmarkLogs.push({
        model: selectedModel.name,
        context: contextDisplay.textContent,
        promptTs: prefillTpsDisplay.textContent,
        genTs: tpsDisplay.textContent,
        command: commandOutput.textContent
    });
    
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(benchmarkLogs));
    renderLogs();
    showToast("Estimate logged!");
});

copyLogBtn.addEventListener('click', () => {
    const md = ["| Model | Context | Prompt T/S | Gen T/S | Command |", "|---|---|---|---|---|"];
    benchmarkLogs.forEach(l => {
        md.push(`| ${l.model} | ${l.context} | ${l.promptTs} | ${l.genTs} | \`${l.command}\` |`);
    });
    navigator.clipboard.writeText(md.join('\n')).then(() => {
        showToast("Benchmark logs copied!");
    });
});

resetBtn.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

init();