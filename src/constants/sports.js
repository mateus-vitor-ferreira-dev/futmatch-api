// Fonte da verdade para modalidades disponíveis no app.
// Deve espelhar o enum CourtType do schema Prisma.
export const SPORTS = [
    { id: "SOCIETY", label: "Society", icon: "⚽", description: "Campo society — grama sintética" },
    { id: "CAMPO", label: "Futebol de Campo", icon: "🏟️", description: "Campo convencional" },
    { id: "FUTSAL", label: "Futsal", icon: "👟", description: "Quadra de futsal coberta" },
    { id: "AREIA", label: "Futevôlei", icon: "🏖️", description: "Quadra de areia" },
    { id: "VOLEI", label: "Vôlei", icon: "🏐", description: "Quadra de vôlei indoor" },
    { id: "VOLEI_AREIA", label: "Vôlei de Areia", icon: "🌊", description: "Quadra de vôlei de areia" },
    { id: "HANDBALL", label: "Handebol", icon: "🤾", description: "Quadra de handebol" },
    { id: "PETECA", label: "Peteca", icon: "🏸", description: "Quadra de peteca" },
    { id: "BEACH_TENNIS", label: "Beach Tennis", icon: "🎾", description: "Quadra de beach tennis" },
    { id: "BASQUETE", label: "Basquete", icon: "🏀", description: "Quadra de basquete" },
    { id: "TENIS", label: "Tênis", icon: "🎾", description: "Quadra de tênis" },
];
