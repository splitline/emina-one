const seasons = ["冬", "春", "夏", "秋"];

const getPastSeasons = (num = 4) =>
    Array(num).fill(0)
    .map((_, i) => {
        const date = new Date();
        return new Date(date.setMonth(date.getMonth() - 3 * i))
    })
    .map(date => date.getFullYear() + seasons[Math.floor(date.getMonth() / 3)]);

const getCurrentSeason = () => {
    const date = new Date();
    return `${date.getFullYear()}年${seasons[Math.floor(date.getMonth() / 3)]}季`
}

export {
    getPastSeasons,
    getCurrentSeason
}