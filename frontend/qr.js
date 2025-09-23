// QR Code generator
const QR = {
    generate: function(text, size = 128) {
        // Create a QR code element
        const qr = document.createElement('canvas');
        qr.width = size;
        qr.height = size;
        const ctx = qr.getContext('2d');
        
        // QR Code settings
        const cellSize = size / 33; // For version 1 QR code (21x21 modules) + quiet zone
        const darkColor = '#000000';
        const lightColor = '#ffffff';
        
        // Clear canvas
        ctx.fillStyle = lightColor;
        ctx.fillRect(0, 0, size, size);
        
        // Generate QR code data matrix
        const matrix = this._generateMatrix(text);
        
        // Draw QR code
        ctx.fillStyle = darkColor;
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    ctx.fillRect(
                        (col + 2) * cellSize, // Add 2 cells for quiet zone
                        (row + 2) * cellSize, // Add 2 cells for quiet zone
                        cellSize,
                        cellSize
                    );
                }
            }
        }
        
        return qr;
    },
    
    _generateMatrix: function(text) {
        // Simple QR Code data encoding
        // This is a simplified version - in production, use a proper QR code library
        const matrix = [];
        const size = 21; // Version 1 QR code size
        
        // Initialize empty matrix
        for (let i = 0; i < size; i++) {
            matrix[i] = new Array(size).fill(false);
        }
        
        // Add finder patterns
        this._addFinderPattern(matrix, 0, 0);
        this._addFinderPattern(matrix, size - 7, 0);
        this._addFinderPattern(matrix, 0, size - 7);
        
        // Add timing patterns
        for (let i = 8; i < size - 8; i++) {
            matrix[6][i] = matrix[i][6] = i % 2 === 0;
        }
        
        // Add alignment pattern
        this._addAlignmentPattern(matrix, size - 9, size - 9);
        
        // Add format information
        for (let i = 0; i < 15; i++) {
            const bit = true; // In real implementation, this would be actual format data
            if (i < 6) {
                matrix[i][8] = bit;
            } else if (i < 8) {
                matrix[i + 1][8] = bit;
            } else {
                matrix[8][size - 15 + i] = bit;
            }
        }
        
        return matrix;
    },
    
    _addFinderPattern: function(matrix, x, y) {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (i === 0 || i === 6 || j === 0 || j === 6 || (i === 2 && j >= 2 && j <= 4) || (i >= 2 && i <= 4 && j === 2)) {
                    matrix[y + i][x + j] = true;
                }
            }
        }
    },
    
    _addAlignmentPattern: function(matrix, x, y) {
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                matrix[y + i][x + j] = i === -2 || i === 2 || j === -2 || j === 2 || (i === 0 && j === 0);
            }
        }
    }
};