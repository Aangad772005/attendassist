class UserDto {
  constructor(user) {
    this.id = user._id;
    this.name = user.name;
    this.email = user.email;
    this.avatar = user.avatar;
    this.institution = user.institution;
    this.semester = user.semester;
    this.defaultRequiredAttendance = user.defaultRequiredAttendance;
    this.hasPassword = !!user.passwordHash;
    this.hasGoogleAuth = !!user.googleId;
    this.createdAt = user.createdAt;
  }

  static toPublicUser(user) {
    return new UserDto(user);
  }
}

module.exports = UserDto;
