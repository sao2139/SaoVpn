const fs = require('fs');
const os = require('os');

const platform = os.platform();
let hostsPath = '';

if (platform === 'win32') {
    hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
} else {
    hostsPath = '/etc/hosts';
}

console.log(`🧹 Iniciando limpieza de DNS en: ${hostsPath}`);

try {
    let contenido = fs.readFileSync(hostsPath, 'utf8');
    let originalLength = contenido.length;

    const objetivos = [
        '127.0.0.1 inicio.clau',
        '127.0.0.1 quantum.clau'
    ];

    objetivos.forEach(target => {
        if (contenido.includes(target)) {
            contenido = contenido.replace(target, '');
            console.log(`   [-] Eliminado: ${target}`);
        }
    });

    contenido = contenido.replace(/^\s*[\r\n]/gm, "");

    if (contenido.length !== originalLength) {
        fs.writeFileSync(hostsPath, contenido);
        console.log('\n✅ DESCONEXIÓN COMPLETADA: Rastro de Clau Network eliminado.');
    } else {
        console.log('\nℹ️  El sistema ya estaba limpio. No se encontraron rastros.');
    }

} catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
        console.error('\n❌ ERROR DE PERMISOS');
        console.error('Debes ejecutar este script como ADMINISTRADOR para limpiar el sistema.');
    } else {
        console.error('\n❌ Error:', error.message);
    }
}