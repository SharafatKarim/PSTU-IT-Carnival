import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Gaming tournament registrations.
//
// One collection for all three tournaments rather than one each: they differ
// only in how many players a row carries, every duplicate check is scoped by
// `game` anyway, and a single collection means one backup, one export and one
// place to look on match day.
//
// The shape is deliberately uniform across entry types — see src/data/gaming.js,
// where every form writes its people to players.<n>.* regardless of whether it
// asked for a squad:
//
//   players[0]         always the person we contact. Carries name, phone and
//                      email; every other row carries a game ID alone.
//   entryType 'team'   a full squad of four, registered together.
//   entryType 'individual'
//                      one player who will be placed in a squad the committee
//                      forms. players has length 1 and teamName is unset.
//   entryType 'solo'   eFootball. A 1v1 entrant, not awaiting a squad.
// ---------------------------------------------------------------------------

const playerSchema = new mongoose.Schema(
  {
    /* Row zero. Stored rather than inferred from position so a mailer can
       query it instead of trusting that nothing ever reorders the array. */
    isLeader: { type: Boolean, default: false },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Player name cannot exceed 100 characters'],
    },
    gameId: {
      type: String,
      required: [true, 'Game ID is required'],
      trim: true,
      maxlength: [40, 'Game ID cannot exceed 40 characters'],
    },
    /* eFootball only: the rules require the device before a round starts. */
    device: {
      type: String,
      trim: true,
      maxlength: [80, 'Device cannot exceed 80 characters'],
    },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    game: {
      type: String,
      required: [true, 'Game slug is required'],
      trim: true,
      index: true,
    },
    entryType: {
      type: String,
      required: [true, 'Entry type is required'],
      enum: {
        values: ['team', 'individual', 'solo'],
        message: 'Entry type must be team, individual or solo',
      },
    },
    /* Squad entries only. Individual and solo entrants have no team yet —
       the committee names theirs when it forms the squad. */
    teamName: {
      type: String,
      trim: true,
      maxlength: [50, 'Team name cannot exceed 50 characters'],
    },
    contact: {
      name: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
      },
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      },
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
        trim: true,
      },
    },
    players: {
      type: [playerSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one player is required',
      },
    },
    /* Every game ID on this registration, lower-cased and flattened. The
       duplicate check is "is this ID already entered for this game", which is
       an $in against an array field — not something the nested players path
       answers cheaply. */
    gameIds: {
      type: [String],
      default: [],
      index: true,
    },
    /* Lifecycle mirrors IUPC: rows land as 'pre-registered' and move to 'paid'
       when the entry fee is collected at the desk on match day. */
    registrationStatus: {
      type: String,
      enum: ['pre-registered', 'paid', 'rejected'],
      default: 'pre-registered',
    },
    registrationId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

/* Duplicate team names are rejected per game, not globally — "Coastal Raiders"
   may enter both PUBG and Free Fire. The check itself is an explicit findOne in
   the route; this index is what makes it cheap. */
registrationSchema.index({ game: 1, teamName: 1 });
registrationSchema.index({ game: 1, 'contact.email': 1 });

export default mongoose.models.GamingRegistration ||
  mongoose.model('GamingRegistration', registrationSchema, 'gaming_registrations');
