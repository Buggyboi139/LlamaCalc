(() => {
    const sourceIds = ['modelPath','hfRepo','modelUrl','dockerRepo'];
    const visibleStarterIds = ['modelPath','hfRepo'];
    const allStarterIds = [...new Set([...sourceIds,...visibleStarterIds])];

    const field = id => document.getElementById(id);
    const filled = id => {
        const el = field(id);
        return !!el && String(el.value || '').trim() !== '';
    };

    const groupFor = id => {
        const el = field(id);
        return el ? el.closest('.input-group') : null;
    };

    const addChip = id => {
        const el = field(id);
        if (!el) return;

        const label = document.querySelector(`label[for="${id}"]`);
        if (!label || label.querySelector('.required-chip')) return;

        const chip = document.createElement('span');
        chip.className = 'required-chip';
        chip.textContent = 'pick one';
        label.appendChild(chip);
    };

    const ensureNote = () => {
        let note = document.getElementById('starterNote');
        if (note) return note;

        const header = document.querySelector('.main-card .main-header');
        if (!header) return null;

        note = document.createElement('div');
        note.id = 'starterNote';
        note.className = 'starter-note';
        header.insertAdjacentElement('afterend', note);
        return note;
    };

    const updateStarterFields = () => {
        const hasSource = sourceIds.some(filled);
        const note = ensureNote();

        allStarterIds.forEach(id => {
            const group = groupFor(id);
            if (!group) return;

            group.classList.remove('starter-field--missing','starter-field--filled');

            if (filled(id)) {
                group.classList.add('starter-field--filled');
                return;
            }

            if (!hasSource && visibleStarterIds.includes(id)) {
                group.classList.add('starter-field--missing');
            }
        });

        if (note) {
            if (hasSource) {
                note.classList.add('starter-note--done');
                note.innerHTML = '<strong>Starter requirement met:</strong> a model source is selected. You can run a basic command now.';
            } else {
                note.classList.remove('starter-note--done');
                note.innerHTML = '<strong>Beginner start:</strong> choose one model source. Use Model path for a local GGUF, or Hugging Face repo for an HF model.';
            }
        }
    };

    const bindStarterFields = () => {
        allStarterIds.forEach(id => {
            addChip(id);

            const el = field(id);
            if (!el) return;

            el.addEventListener('input', updateStarterFields);
            el.addEventListener('change', updateStarterFields);
        });

        document.querySelectorAll('input[name="mode"]').forEach(el => {
            el.addEventListener('change', updateStarterFields);
        });

        updateStarterFields();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindStarterFields);
    } else {
        bindStarterFields();
    }
})();