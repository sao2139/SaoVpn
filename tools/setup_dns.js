const fs = require('fs');
const os = require('os');

const platform = os.platform();
let hostsPath = '';

if (platform === 'win32') {
    hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
} else {
    hostsPath = '/etc/hosts';
}

const nuevosDominios = [
    '\n127.0.0.1 inicio.clau',
    '\n127.0.0.1 quantum.clau'
];

console.log(`🔍 Analizando archivo de sistema en: ${hostsPath}`);

try {
    let contenido = fs.readFileSync(hostsPath, 'utf8');
    let modificado = false;

    nuevosDominios.forEach(dominio => {
        const dominioLimpio = dominio.trim(); 
        if (!contenido.includes(dominioLimpio)) {
            contenido += dominio;
            modificado = true;
            console.log(`   [+] Agregando: ${dominioLimpio}`);
        } else {
            console.log(`   [OK] Ya existe: ${dominioLimpio}`);
        }
    });

    if (modificado) {
        fs.writeFileSync(hostsPath, contenido);
        console.log('\n✅ ÉXITO: Red Clau configurada en el sistema.');
    } else {
        console.log('\n✅ El sistema ya estaba configurado correctamente.');
    }

} catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
        console.error('\n❌ ERROR DE PERMISOS');
        console.error('Windows protege este archivo. Debes ejecutar este script como ADMINISTRADOR.');
    } else {
        console.error('\n❌ Error inesperado:', error.message);
    }
}