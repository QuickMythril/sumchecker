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

    // Handle file selection
    fileSelector.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            fileSizeDisplay.textContent = file.size;
            fileInfo.style.display = 'block';
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
    });

    // Update checksums when input changes
    checksumInput.addEventListener('input', function() {
        updateChecksums();
    });

    function readFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fileContent = e.target.result;
            calculateChecksums();
        };
        reader.readAsBinaryString(file);
    }

    function calculateChecksums() {
        if (!fileContent) return;

        const md5 = new Hashes.MD5().hex(fileContent);
        const sha1 = new Hashes.SHA1().hex(fileContent);
        const sha256 = new Hashes.SHA256().hex(fileContent);
        const sha512 = new Hashes.SHA512().hex(fileContent);

        checksumsDiv.innerHTML = `
            <div class="checksum-item" id="md5">MD5: ${md5}</div>
            <div class="checksum-item" id="sha1">SHA1: ${sha1}</div>
            <div class="checksum-item" id="sha256">SHA256: ${sha256}</div>
            <div class="checksum-item" id="sha512">SHA512: ${sha512}</div>
        `;

        updateChecksums();
    }

    function updateChecksums() {
        const inputChecksum = checksumInput.value.trim().toLowerCase();
        if (!inputChecksum) {
            resetChecksumStyles();
            return;
        }

        ['md5', 'sha1', 'sha256', 'sha512'].forEach(function(algorithm) {
            const checksumElement = document.getElementById(algorithm);
            if (!checksumElement) return;
            const checksumText = checksumElement.textContent.split(': ')[1].trim().toLowerCase();
            if (checksumText === inputChecksum) {
                checksumElement.classList.add('valid');
                checksumElement.classList.remove('invalid');
            } else {
                checksumElement.classList.add('invalid');
                checksumElement.classList.remove('valid');
            }
        });
    }

    function resetChecksumStyles() {
        document.querySelectorAll('.checksum-item').forEach(function(element) {
            element.classList.remove('valid', 'invalid');
        });
    }
});
