interface ObjectNumberOfNumbers {
    [key: number]: number[];
}
//Deny Flags
export const DENY_USER_NOT_EXIST: number = 1;
export const DENY_USER_OR_PASS_WRONG: number = 2;
export const DENY_NO_PERMISSION: number = 4;
export const DENY_INVALID_FLAGS: number = 8;

/*
Message Flags
*/
export const IS_MODER_ONLY: number = 1;
export const IS_ADMIN_ONLY: number = 2;
export const IS_OWNER_ONLY: number = 4;

/*
Channel Flags (bit fields/flags/masks)
*/
//export const X_X: number = 1; //
//export const X_X: number = 2; //
//export const X_X: number = 4; //
//export const X_X: number = 8; //
//export const X_X: number = 16; //
//export const X_X: number = 32; //
//export const X_X: number = 64; //
//export const X_X: number = 128; //
//export const X_X: number = 256; //
//export const X_X: number = 512; //
//export const X_X: number = 1024; //
//export const X_X: number = 2048; //
//export const X_X: number = 4096; //
//export const X_X: number = 8192; //
//export const X_X: number = 16384; //
//export const X_X: number = 32768; //
//export const X_X: number = 65536; //
//export const X_X: number = 131072; //
//export const X_X: number = 262144; //
//export const X_X: number = 524288; //
//export const X_X: number = 1048576; //
//export const X_X: number = 2097152; //
//export const X_X: number = 4194304; //
//export const X_X: number = 8388608; //
//export const X_X: number = 16777216; //
//export const X_X: number = 33554432; //
//export const X_X: number = 67108864; //
//export const X_X: number = 134217728; //
//export const X_X: number = 268435456; //
//export const X_X: number = 536870912; //
//export const X_X: number = 1073741824; //
//export const X_X: number = 2147483648; //
//export const X_X: number = 4294967296; //
//export const X_X: number = 8589934592; //
//export const X_X: number = 17179869184; //
//export const X_X: number = 34359738368; //
//export const X_X: number = 68719476736; //
//export const X_X: number = 137438953472; //
//export const X_X: number = 274877906944; //
//export const X_X: number = 549755813888; //
//export const X_X: number = 1099511627776; //
//export const X_X: number = 2199023255552; //
//export const X_X: number = 4398046511104; //
//export const X_X: number = 8796093022208; //
//export const X_X: number = 17592186044416; //
//export const X_X: number = 35184372088832; //
//export const X_X: number = 70368744177664; //
//export const X_X: number = 140737488355328; //
//export const X_X: number = 281474976710656; //
//export const X_X: number = 562949953421312; //
//export const X_X: number = 1125899906842624; //
//export const X_X: number = 2251799813685248; //
//export const X_X: number = 4503599627370496; //


/*
User Flags (bit fields/flags/masks)
Max Value (added, all bit fields set): 2^53 - 1 = 9007199254740991 (same as the max javascript int)
Max Bit Field: 2^50 = 1125899906842624
*/
export const ICON_MOD: number = 1; //Showing mod icon
export const ICON_ADMIN: number = 2; //showing admin icon
export const ICON_OWNER: number = 4; //showing owner icon
export const IP_MASKED: number = 8; //ip is set to masked
export const USER_FLAGGED: number = 16; //flagged by a user
export const MOD_FLAGGED: number = 32; //flagged by a moderator
export const BYPASS_SPAM: number = 64; //bypass spam settings
export const BYPASS_AMOD: number = 128; //bypass auto moderation settings
export const BYPASS_FILTER: number = 256; //bypass filter
export const BYPASS_LOCK: number = 512; //bypass locked channel
//export const X_X: number = 1024; //
//export const X_X: number = 2048; //
//export const X_X: number = 4096; //
//export const X_X: number = 8192; //
//export const X_X: number = 16384; //
//export const X_X: number = 32768; //
//export const X_X: number = 65536; //
//export const X_X: number = 131072; //
//export const X_X: number = 262144; //
//export const X_X: number = 524288; //
//export const X_X: number = 1048576; //
//export const X_X: number = 2097152; //
//export const X_X: number = 4194304; //
//export const X_X: number = 8388608; //
//export const X_X: number = 16777216; //
//export const X_X: number = 33554432; //
//export const X_X: number = 67108864; //
//export const X_X: number = 134217728; //
//export const X_X: number = 268435456; //
//export const X_X: number = 536870912; //
//export const X_X: number = 1073741824; //
//export const X_X: number = 2147483648; //
//export const X_X: number = 4294967296; //
//export const X_X: number = 8589934592; //
//export const X_X: number = 17179869184; //
//export const X_X: number = 34359738368; //
//export const X_X: number = 68719476736; //
//export const X_X: number = 137438953472; //
//export const X_X: number = 274877906944; //
//export const X_X: number = 549755813888; //
//export const X_X: number = 1099511627776; //
//export const X_X: number = 2199023255552; //
//export const X_X: number = 4398046511104; //
//export const X_X: number = 8796093022208; //
//export const X_X: number = 17592186044416; //
//export const X_X: number = 35184372088832; //
//export const X_X: number = 70368744177664; //
//export const X_X: number = 140737488355328; //
//export const X_X: number = 281474976710656; //
//export const X_X: number = 562949953421312; //
//export const X_X: number = 1125899906842624; //
//export const X_X: number = 2251799813685248; //
export const IS_GLOBAL_OWNER: number = 1125899906842624; //user is a global owner


/*
Permission Flags (bit fields/flags/masks)
Max Value (added, all bit fields set): 2^53 - 1 = 9007199254740991 (same as the max javascript int)
Max Bit Field: 2^50 = 1125899906842624
Each permission has a list of required permissions for evaluation.
*/
export var REQUIRED: ObjectNumberOfNumbers = {};
export const IS_MODER: number = 1; //user is a channel moderator, can use the moderator icon, and moderator permissions (i.e. if there is a moderator only permission they can't use it without this)
export const IS_ADMIN: number = 2; //user is a channel admin, can use the admin icon, and admin permissions (i.e. if there is an admin only permission they can't use it without this)
export const IS_OWNER: number = 4; //user is a channel owner, can use the owner icon, have all permissions, and they are protected from other users modifying them unless they are also a channel owner
export const IP_VIEW: number = 8; //Allow these users to view IP addresses
export const IP_MASK: number = 16; //this user can mask their ip
export const LOG_EVENT: number = 32; //can view event log
//export const X_X: number = 64; //
//export const X_X: number = 128; //
//export const X_X: number = 256; //
//export const X_X: number = 512; //
//export const X_X: number = 1024; //
//export const X_X: number = 2048; //
//export const X_X: number = 4096; //
//export const X_X: number = 8192; //
//export const X_X: number = 16384; //
//export const X_X: number = 32768; //
//export const X_X: number = 65536; //
//export const X_X: number = 131072; //
//export const X_X: number = 262144; //
REQUIRED[LOG_EVENT] = [IS_ADMIN];
REQUIRED[IP_VIEW] = [IS_MODER];
REQUIRED[IP_MASK] = [IS_ADMIN];
REQUIRED[IS_MODER] = [];
REQUIRED[IS_ADMIN] = [IS_MODER];
REQUIRED[IS_OWNER] = [];

export const WRITE_HIDE: number = 524288; //Can hide Message
export const UPDATE_HIDE: number = 1048576; //Can unhide Message
export const VIEW_HIDE: number = 2097152; //Can see hidden Message
export const DELETE_HIDE: number = 4194304; //Can delete records of hidden messages
REQUIRED[WRITE_HIDE] = [VIEW_HIDE, IS_MODER];
REQUIRED[UPDATE_HIDE] = [VIEW_HIDE, IS_MODER];
REQUIRED[VIEW_HIDE] = [IS_MODER];
REQUIRED[DELETE_HIDE] = [VIEW_HIDE, IS_MODER];

export const WRITE_BAN: number = 8388608;  //Can Ban Users
export const UPDATE_BAN: number = 16777216; //Can Modify Bans of other moderators
export const VIEW_BAN: number = 33554432; //Can view banned user list (required to write/update/delete ban)
export const DELETE_BAN: number = 67108864; //Can unban users manually for all moderators
REQUIRED[WRITE_BAN] = [VIEW_BAN, IS_MODER];
REQUIRED[UPDATE_BAN] = [VIEW_BAN, IS_MODER];
REQUIRED[VIEW_BAN] = [IS_MODER];
REQUIRED[DELETE_BAN] = [VIEW_BAN, IS_MODER];

export const WRITE_USER: number = 134217728; //Can edit user flags, notes, etc.
export const UPDATE_USER: number = 268435456; //Can change user notes and flags
export const VIEW_USER: number = 536870912; //View user flags, notes, etc.
export const DELETE_USER: number = 1073741824; //Can delete user record from the channel (i.e. flags, notes, etc)
REQUIRED[WRITE_USER] = [VIEW_USER, IS_MODER];
REQUIRED[UPDATE_USER] = [VIEW_USER, IS_MODER];
REQUIRED[VIEW_USER] = [IS_MODER];
REQUIRED[DELETE_USER] = [VIEW_USER, IS_MODER];

export const WRITE_PERM: number = 2147483648; //Can add users to the permission list
export const UPDATE_PERM: number = 4294967296; //Can edit users permissions on the permission list as long as they themselves have the specific permission, and the user is in the appropriate group
export const VIEW_PERM: number = 8589934592; //Can view users on the permission list and their permissions (required for all other perm permissions)
export const DELETE_PERM: number = 17179869184; //Can remove users from the permissions list entirely
REQUIRED[WRITE_PERM] = [VIEW_PERM, IS_ADMIN];
REQUIRED[UPDATE_PERM] = [VIEW_PERM, IS_ADMIN];
REQUIRED[VIEW_PERM] = [IS_ADMIN];
REQUIRED[DELETE_PERM] = [VIEW_PERM, IS_ADMIN];

export const WRITE_CHAN: number = 34359738368; //update channel basic settings
export const UPDATE_CHAN: number = 34359738368; //
export const VIEW_CHAN: number = 68719476736; //view channel basic settings
export const DELETE_CHAN: number = 137438953472; //can delete the channel
REQUIRED[WRITE_CHAN] = [VIEW_CHAN, IS_ADMIN];
REQUIRED[UPDATE_CHAN] = [VIEW_CHAN, IS_ADMIN];
REQUIRED[VIEW_CHAN] = [IS_ADMIN];
REQUIRED[DELETE_CHAN] = [VIEW_CHAN, IS_ADMIN];

export const WRITE_FILT: number = 274877906944; //can exempt people from filter
export const UPDATE_FILT: number = 549755813888; //update filter list and settings
export const VIEW_FILT: number = 1099511627776; //view filter list and filter settings (required for other filter operations)
export const DELETE_FILT: number = 2199023255552; //can unexcempt people from filter
REQUIRED[WRITE_FILT] = [VIEW_FILT, IS_ADMIN];
REQUIRED[UPDATE_FILT] = [VIEW_FILT, IS_ADMIN];
REQUIRED[VIEW_FILT] = [IS_ADMIN];
REQUIRED[DELETE_FILT] = [VIEW_FILT, IS_ADMIN];

export const WRITE_MODER: number = 4398046511104; //can exempt people from auto moderation
export const UPDATE_MODER: number = 8796093022208; //can update auto moderation settings
export const VIEW_MODER: number = 17592186044416; //can view moderation settings
export const DELETE_MODER: number = 35184372088832; //can unexempt people from auto moderation
REQUIRED[WRITE_MODER] = [VIEW_MODER, IS_ADMIN];
REQUIRED[UPDATE_MODER] = [VIEW_MODER, IS_ADMIN];
REQUIRED[VIEW_MODER] = [IS_ADMIN];
REQUIRED[DELETE_MODER] = [VIEW_MODER, IS_ADMIN];

export const WRITE_SPAM: number = 70368744177664; //
export const UPDATE_SPAM: number = 140737488355328; //
export const VIEW_SPAM: number = 562949953421312; //
export const DELETE_SPAM: number = 1125899906842624; //
REQUIRED[WRITE_SPAM] = [VIEW_SPAM, IS_ADMIN];
REQUIRED[UPDATE_SPAM] = [VIEW_SPAM, IS_ADMIN];
REQUIRED[VIEW_SPAM] = [IS_ADMIN];
REQUIRED[DELETE_SPAM] = [VIEW_SPAM, IS_ADMIN];