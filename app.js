// Main JavaScript for Python Learning App
document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress chart
    const progressChart = document.getElementById('progressChart');
    if (progressChart) {
        new Chart(progressChart, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [25, 75],
                    backgroundColor: ['#8A2BE2', '#333'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }

    // Initialize Pyodide for code execution
    async function initPyodide() {
        try {
            const pyodide = await loadPyodide();
            console.log("Pyodide loaded successfully");
            
            // Set up code editor and execution
            const codeEditor = document.getElementById('code-editor');
            const codeOutput = document.getElementById('code-output');
            const runButton = document.getElementById('run-code');
            const resetButton = document.getElementById('reset-code');
            
            if (codeEditor && codeOutput && runButton) {
                // Store the initial code for reset functionality
                const initialCode = codeEditor.value;
                
                // Add tab key support for proper indentation
                codeEditor.addEventListener('keydown', function(e) {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        
                        // Insert tab at cursor position
                        const start = this.selectionStart;
                        const end = this.selectionEnd;
                        
                        // Set textarea value to: text before caret + tab + text after caret
                        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
                        
                        // Move caret to position after inserted tab
                        this.selectionStart = this.selectionEnd = start + 4;
                    }
                });
                
                // Run code button
                runButton.addEventListener('click', async function() {
                    codeOutput.innerHTML = '<p>Running code...</p>';
                    try {
                        // Get the code from the editor
                        const code = codeEditor.value;
                        
                        // Create a custom output capture function
                        let capturedOutput = '';
                        
                        // Define a custom Python function to replace the built-in print
                        await pyodide.runPythonAsync(`
                            import sys
                            from io import StringIO
                            
                            # Redirect stdout to capture print output
                            sys.stdout = StringIO()
                        `);
                        
                        // Run the user's code
                        await pyodide.runPythonAsync(code);
                        
                        // Get the captured output
                        const output = await pyodide.runPythonAsync(`
                            captured_output = sys.stdout.getvalue()
                            captured_output
                        `);
                        
                        // Reset stdout
                        await pyodide.runPythonAsync(`
                            sys.stdout = sys.__stdout__
                        `);
                        
                        // Display the output
                        if (output && output.trim() !== '') {
                            codeOutput.innerHTML = '<pre>' + output + '</pre>';
                        } else {
                            codeOutput.innerHTML = '<p>Code executed successfully with no output.</p>';
                        }
                    } catch (error) {
                        codeOutput.innerHTML = `<pre class="error">Error executing code: ${error.message}</pre>`;
                    }
                });
                
                // Reset code button
                if (resetButton) {
                    resetButton.addEventListener('click', function() {
                        codeEditor.value = initialCode;
                        codeOutput.innerHTML = '<p class="output-placeholder">Code output will appear here...</p>';
                    });
                }
            }
            
            // Add event listeners to quiz option buttons
            const quizOptions = document.querySelectorAll('.quiz-option-button');
            quizOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Logic is handled inline in the HTML
                });
            });
            
        } catch (error) {
            console.error("Failed to load Pyodide:", error);
            const codeOutput = document.getElementById('code-output');
            if (codeOutput) {
                codeOutput.innerHTML = `<p class="error">Failed to initialize Python environment: ${error.message}</p>`;
            }
        }
    }

    // Initialize Pyodide
    initPyodide();
});
