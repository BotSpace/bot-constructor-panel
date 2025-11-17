"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { instance, instanceAuth } from "@/services/instance";
import useProjectStore from "@/features/bot-constructor/store/project";
import toast from "react-hot-toast";

interface BotData {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
  can_connect_to_business: boolean;
  has_main_web_app: boolean;
}

interface BotInfoDialogProps {
  children: React.ReactNode;
}

export default function DebugBotEdit({ children }: BotInfoDialogProps) {
  const { project } = useProjectStore();

  const [botData, setBotData] = useState({
    id: 7979771827,
    is_bot: true,
    first_name: "sizning_bot",
    username: "bu_sizning_bot",
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: false,
  });

  const [token, setToken] = useState("");
  const [tokenCopied, setTokenCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleSaveToken = async () => {
    setIsEditing(false);
    const toastId = toast.success("Loading...");

    // Here you would typically make an API call to save the token

    const { data: newBot } = await instance.get(
      `https://api.telegram.org/bot${token}/getMe`
    );

    if (!newBot.ok) {
      toast.error("Bot tokeni xato", { id: toastId });
      return;
    }

    instanceAuth
      .patch(`/enviroment/BOT_TOKEN/?project=${project?.id}`, {
        value: token,
      })
      .then(() => {
        setBotData(newBot["result"]);
        toast.success("Bot tokeni yangilandi", { id: toastId });
      })
      .catch(() => {
        toast.error("Xatolik yuz berdi", { id: toastId });
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <div className="space-y-6 py-4">
          {/* Bot Avatar and Basic Info */}
          <div className="flex items-center gap-4 pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
              🤖
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {botData.first_name}
              </h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                @{botData.username}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                ID: {botData.id}
              </p>
            </div>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              ✓ Active
            </div>
          </div>

          {/* Bot Token */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Bot Token</label>
            <div className="flex gap-2">
              {isEditing ? (
                <Input
                  type="text"
                  placeholder="Paste your bot token here"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              ) : (
                <div className="flex-1 px-4 py-2 rounded-lg border font-mono text-sm truncate flex items-center">
                  {"*".repeat(Math.max(8, token.length / 2))}
                </div>
              )}
              {!isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyToken}
                    className="gap-2"
                  >
                    {tokenCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant={"outline"}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => handleSaveToken()}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep your bot token secure and never share it publicly
            </p>
          </div>

          {/* Permissions Grid */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Permissions
            </label>
            <div className="grid grid-cols-2 gap-3">
              <PermissionItem
                title="Join Groups"
                value={botData.can_join_groups}
              />
              <PermissionItem
                title="Read All Messages"
                value={botData.can_read_all_group_messages}
              />
              <PermissionItem
                title="Inline Queries"
                value={botData.supports_inline_queries}
              />
              <PermissionItem
                title="Business Connection"
                value={botData.can_connect_to_business}
              />
              <PermissionItem
                title="Web App"
                value={botData.has_main_web_app}
              />
              <PermissionItem title="Is Bot" value={botData.is_bot} />
            </div>
          </div>

          {/* Bot Type and Status */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                Active
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Type
              </p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                Bot Account
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PermissionItemProps {
  title: string;
  value: boolean;
}

function PermissionItem({ title, value }: PermissionItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <span className="text-sm font-medium">{title}</span>
      <span
        className={`text-sm font-bold ${
          value
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {value ? "✓" : "✗"}
      </span>
    </div>
  );
}
