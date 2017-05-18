export interface IUser {
	id: number | undefined,
	name: string | undefined,
	display: string | undefined,
	session: string,
	auth: boolean,
	flags: IUserFlags
}

export interface IUserFlags {
	perm: number,
	user: number
}

export interface IAuth {
    name: string | undefined
}

export interface IUnauth {
	name: string | undefined,
}

export interface IHide {

}

export interface IUnhide {
	ids: number[],
	name: string | undefined
}

export interface ILogin {
    name: string,
    password: string
}

export interface ILogout {

}

export interface IMessageIncoming {
    text: string,
    flags?: number
}

export interface IMessage {
    name: string | undefined,
    display: string | undefined,
    date: Date,
    ip: string | undefined,
    text: string,
    flags?: number | undefined
}