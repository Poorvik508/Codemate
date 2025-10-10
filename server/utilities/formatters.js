// This is now the single source of truth for formatting user data
export const formatUserForResponse = (user) => {
    if (!user) return null;
    const userObject = user.toObject ? user.toObject() : user;
    return {
        _id: userObject._id,
        name: userObject.name,
        profilePic: userObject.profilePic,
        bio: userObject.bio,
        location: userObject.location,
        availability: userObject.availability,
        college: userObject.college,
        skills: userObject.skills ? userObject.skills.map(s => s.name || s) : [],
    };
};