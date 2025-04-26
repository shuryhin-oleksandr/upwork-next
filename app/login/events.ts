import mitt from "mitt";

export const REDIRECT_TO_LOGIN = "redirectToLogin";

type Events = {
  [REDIRECT_TO_LOGIN]: void;
};

export const emitter = mitt<Events>();
