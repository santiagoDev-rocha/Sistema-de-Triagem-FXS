requireAuthWithRole(function(user, role) {
    if (role === 'MEDICO') {
        document.querySelectorAll('[data-admin-only]').forEach(function(el) {
            el.style.display = 'none';
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (window.lucide) lucide.createIcons();
});
