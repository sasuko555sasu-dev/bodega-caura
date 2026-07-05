function toggleMenu() {
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    
    sideMenu.classList.toggle('open');
    overlay.classList.toggle('open');
}