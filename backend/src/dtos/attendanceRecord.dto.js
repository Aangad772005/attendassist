class AttendanceRecordDto {
  constructor(record) {
    this.id = record._id || record.id;
    this.date = record.date ? record.date.toISOString().split('T')[0] : null;
    this.status = record.status;
    this.note = record.note;
    this.editedAt = record.editedAt;
    this.createdAt = record.createdAt;

    // Map populated subject properties
    if (record.subjectId) {
      this.subject = {
        id: record.subjectId._id || record.subjectId.id || record.subjectId,
        name: record.subjectId.name || null,
        code: record.subjectId.code || null,
        color: record.subjectId.color || null,
      };
    }
  }

  static toPublicRecord(record) {
    return new AttendanceRecordDto(record);
  }

  static toPublicRecordList(records) {
    return records.map(r => new AttendanceRecordDto(r));
  }
}

module.exports = AttendanceRecordDto;
