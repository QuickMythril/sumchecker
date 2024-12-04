document.addEventListener('DOMContentLoaded', function() {
    const fileSelector = document.getElementById('file-selector');
    const fileInput = document.getElementById('file-input');
    const checksumInput = document.getElementById('checksum-input');
    const clearInputButton = document.getElementById('clear-input');
    const clearFileButton = document.getElementById('clear-file');
    const fileInfo = document.getElementById('file-info');
    const fileNameDisplay = document.getElementById('file-name');
    const fileSizeDisplay = document.getElementById('file-size');
    const checksumsDiv = document.getElementById('checksums');
    let fileContent = null;
    // List of algorithms
    const algorithms = ['MD5', 'SHA1', 'SHA256', 'SHA512'];
    let checksumResults = {};
    // Initialize checksumResults
    algorithms.forEach(algo => {
        checksumResults[algo] = 'Pending';
    });
    // Handle file selection
    fileSelector.addEventListener('click', function() {
        fileInput.click();
    });
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            fileSizeDisplay.textContent = formatFileSize(file.size);
            fileInfo.style.display = 'block';
            resetChecksumResults();
            readFile(file);
        }
    });
    // Clear input field
    clearInputButton.addEventListener('click', function() {
        checksumInput.value = '';
        updateChecksums();
    });
    // Clear selected file
    clearFileButton.addEventListener('click', function() {
        fileInput.value = '';
        fileInfo.style.display = 'none';
        checksumsDiv.innerHTML = '';
        fileContent = null;
        resetChecksumResults();
    });
    // Update checksums when input changes
    checksumInput.addEventListener('input', function() {
        updateChecksums();
    });

    function readFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            const bytes = new Uint8Array(arrayBuffer);
            fileContent = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
            displayInitialChecksums();
            calculateChecksumsSequentially();
        };
        reader.readAsArrayBuffer(file);
    }

    function formatFileSize(size) {
        if (size >= 1024 * 1024) {
            return (size / (1024 * 1024)).toFixed(2) + ' MB';
        } else if (size >= 1024) {
            return (size / 1024).toFixed(2) + ' KB';
        } else {
            return size + ' bytes';
        }
    }

    function displayInitialChecksums() {
        checksumsDiv.innerHTML = '';
        algorithms.forEach(algo => {
            checksumsDiv.innerHTML += `
                <div class="checksum-item" id="${algo.toLowerCase()}">${algo}: Pending</div>
            `;
        });
    }

    function resetChecksumResults() {
        algorithms.forEach(algo => {
            checksumResults[algo] = 'Pending';
        });
    }

    function calculateChecksumsSequentially() {
        let index = 0;
        function calculateNext() {
            if (index >= algorithms.length) {
                updateChecksums();
                return;
            }
            const algo = algorithms[index];
            const checksumElement = document.getElementById(algo.toLowerCase());
            checksumElement.textContent = `${algo}: Calculating...`;
            setTimeout(() => {
                let hash;
                if (algo === 'MD5') {
                    hash = new Hashes.MD5().hex(fileContent);
                } else if (algo === 'SHA1') {
                    hash = new Hashes.SHA1().hex(fileContent);
                } else if (algo === 'SHA256') {
                    hash = new Hashes.SHA256().hex(fileContent);
                } else if (algo === 'SHA512') {
                    hash = new Hashes.SHA512().hex(fileContent);
                }
                checksumResults[algo] = hash;
                checksumElement.innerHTML = `${algo}: <code>${hash}</code>`;
                updateChecksums();
                index++;
                calculateNext();
            }, 100); // Small delay to allow UI updates
        }
        calculateNext();
    }

    function updateChecksums() {
        const inputChecksum = checksumInput.value.trim().toLowerCase();
        if (!inputChecksum) {
            resetChecksumStyles();
            return;
        }
        algorithms.forEach(algo => {
            const checksumElement = document.getElementById(algo.toLowerCase());
            if (!checksumElement) return;
            const checksumValue = checksumResults[algo];
            if (checksumValue.toLowerCase() === inputChecksum) {
                checksumElement.classList.add('valid');
                checksumElement.classList.remove('invalid');
            } else if (checksumValue !== 'Pending' && checksumValue !== 'Calculating...') {
                checksumElement.classList.remove('valid');
                checksumElement.classList.add('invalid');
            }
        });
    }

    function resetChecksumStyles() {
        document.querySelectorAll('.checksum-item').forEach(function(element) {
            element.classList.remove('valid', 'invalid');
        });
    }
});
